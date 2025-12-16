import { defineBackground } from '#imports';
import { browser } from 'wxt/browser';
import { sendToAllEnabled, hasAnyConfigured, type SendResult, type PlatformType } from '@/lib/platforms';

export default defineBackground(() => {
  console.log('Clipper Hub - 万能剪藏 - 后台服务启动', { id: browser.runtime.id });

  // Create context menu when extension is installed
  browser.runtime.onInstalled.addListener(() => {
    // Parent menu
    browser.contextMenus.create({
      id: "telegramParent",
      title: "Clipper Hub - 万能剪藏",
      contexts: ["all"]
    });

    // Child menu: Send selected text
    browser.contextMenus.create({
      id: "sendToTelegram",
      parentId: "telegramParent",
      title: "发送选中文字",
      contexts: ["selection"]
    });

    // Child menu: Edit before sending
    browser.contextMenus.create({
      id: "editBeforeSend",
      parentId: "telegramParent",
      title: "编辑后发送",
      contexts: ["selection"]
    });

    // Child menu: Bookmark page
    browser.contextMenus.create({
      id: "bookmarkPage",
      parentId: "telegramParent",
      title: "收藏网址",
      contexts: ["page"]
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToTelegram" && info.selectionText) {
      getSelectionWithLineBreaks(tab, (text) => {
        sendToAllPlatforms(text || info.selectionText || '');
      });
    } else if (info.menuItemId === "editBeforeSend" && info.selectionText && tab) {
      openEditPage(info.selectionText, tab.url || '');
    } else if (info.menuItemId === "bookmarkPage" && tab) {
      bookmarkPage(tab);
    }
  });

  // Listen for messages from options/edit pages
  browser.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
    if (request.action === 'testNotification') {
      showNotification('测试通知', '这是一条测试通知消息');
      sendResponse({ success: true });
    } else if (request.action === 'sendToTelegram' || request.action === 'sendToAllPlatforms') {
      // 兼容旧的 sendToTelegram action，同时支持新的 sendToAllPlatforms
      sendToAllPlatforms(request.text).then(results => {
        sendResponse({ success: true, results });
      });
      return true; // 保持消息通道开放用于异步响应
    }
    return true;
  });
});

const browserAPI = (typeof browser !== 'undefined' ? browser : chrome);

// 获取带换行的选中文本
function getSelectionWithLineBreaks(tab: any, callback: (text: string | null) => void) {
  if (!tab || !tab.id) {
    callback(null);
    return;
  }

  const restrictedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:'];
  const isRestricted = restrictedProtocols.some(protocol =>
    tab.url && tab.url.startsWith(protocol)
  );

  if (isRestricted) {
    callback(null);
    return;
  }

  browserAPI.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return null;

      const range = selection.getRangeAt(0);
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      const html = container.innerHTML;
      
      // 从 HTML 提取带换行的文本
      function htmlToText(html: string) {
        let text = html;
        
        // 处理 <br> 标签
        text = text.replace(/<br\s*\/?>/gi, '\n');
        
        // 在块级元素结束标签后添加换行
        const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'blockquote', 'pre', 'article', 'section'];
        blockTags.forEach(tag => {
          const regex = new RegExp(`</${tag}>`, 'gi');
          text = text.replace(regex, `</${tag}>\n`);
        });
        
        // 移除 HTML 标签
        const div = document.createElement('div');
        div.innerHTML = text;
        text = div.textContent || '';
        
        text = text.split('\n').map(line => line.trim()).join('\n');
        // 把连续空行压缩成单个换行
        return text.replace(/\n{2,}/g, '\n').trim();
      }
      
      return htmlToText(html) || null;
    }
  }, (results: any) => {
    if (browserAPI.runtime.lastError || !results || !results[0]) {
      callback(null);
      return;
    }
    callback(results[0].result);
  });
}

// 发送消息到所有已启用的平台
async function sendToAllPlatforms(text: string): Promise<Record<PlatformType, SendResult>> {
  // 检查是否有任何平台已配置
  const hasConfigured = await hasAnyConfigured();
  
  if (!hasConfigured) {
    showNotification("配置缺失", "请先在扩展选项中配置至少一个平台");
    browserAPI.runtime.openOptionsPage();
    return {} as Record<PlatformType, SendResult>;
  }

  try {
    const results = await sendToAllEnabled(text);
    
    // 统计发送结果
    const successPlatforms: string[] = [];
    const failedPlatforms: string[] = [];
    
    for (const [platform, result] of Object.entries(results)) {
      if (result.success) {
        successPlatforms.push(platform);
      } else {
        failedPlatforms.push(`${platform}: ${result.error}`);
      }
    }
    
    // 显示通知
    if (successPlatforms.length > 0 && failedPlatforms.length === 0) {
      showNotification("发送成功", `消息已发送到: ${successPlatforms.join(', ')}`);
    } else if (successPlatforms.length > 0 && failedPlatforms.length > 0) {
      showNotification("部分发送成功", `成功: ${successPlatforms.join(', ')}\n失败: ${failedPlatforms.join(', ')}`);
    } else {
      showNotification("发送失败", failedPlatforms.join('\n'));
    }
    
    return results;
  } catch (error: any) {
    console.error("Send Error:", error);
    showNotification("发送失败", error.message || "未知错误");
    return {} as Record<PlatformType, SendResult>;
  }
}

function bookmarkPage(tab: any) {
  const title = tab.title || "无标题";
  const url = tab.url || "";
  const message = `${title}\n\n${url}`;
  
  // 打开编辑页面预览内容
  browserAPI.storage.local.set({
    'edit_content': message,
    'edit_content_html': '',
    'edit_url': url,
    'edit_title': title
  }, () => {
    browserAPI.windows.create({
      url: 'edit.html',
      type: 'popup',
      width: 650,
      height: 600
    });
  });
}

function openEditPage(initialSelection: string, pageUrl: string) {
  const saveAndOpenEdit = (textContent: string, url: string, title: string, htmlContent: string) => {
    browserAPI.storage.local.set({
      'edit_content': textContent,
      'edit_content_html': htmlContent || '',
      'edit_url': url,
      'edit_title': title
    }, () => {
      browserAPI.windows.create({
        url: 'edit.html',
        type: 'popup',
        width: 650,
        height: 600,
        left: 100,
      });
    });
  };

  browserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs: any[]) => {
    const activeTab = tabs[0];

    if (!activeTab || !activeTab.id) {
      saveAndOpenEdit(initialSelection, pageUrl, '', '');
      return;
    }

    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:'];
    const isRestricted = restrictedProtocols.some(protocol =>
      activeTab.url && activeTab.url.startsWith(protocol)
    );

    if (isRestricted) {
      saveAndOpenEdit(initialSelection, pageUrl, activeTab.title || '', '');
      return;
    }

    browserAPI.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return { html: '', text: '' };

        const range = selection.getRangeAt(0);
        const htmlContent = (() => {
          const div = document.createElement('div');
          div.appendChild(range.cloneContents());
          return div.innerHTML;
        })();

        function htmlToText(html: string) {
          let text = html;
          
          text = text.replace(/<br\s*\/?>/gi, '\n');
          
          const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'blockquote', 'pre', 'article', 'section', 'header', 'footer', 'aside', 'dd', 'dt', 'figcaption', 'figure', 'ol', 'ul', 'table', 'address'];
          blockTags.forEach(tag => {
            const regex = new RegExp(`</${tag}>`, 'gi');
            text = text.replace(regex, `</${tag}>\n`);
          });
          
          text = text.replace(/<hr\s*\/?>/gi, '\n---\n');
          
          const div = document.createElement('div');
          div.innerHTML = text;
          text = div.textContent || div.innerText || '';
          
          text = text.split('\n').map(line => line.trim()).join('\n');
          text = text.replace(/\n{2,}/g, '\n').trim();
          
          return text;
        }
        
        let processedText = htmlToText(htmlContent);

        const processingContainer = document.createElement('div');
        processingContainer.innerHTML = htmlContent;
        const baseUrl = window.location.origin;

        const images = processingContainer.querySelectorAll('img');
        images.forEach(img => {
          const src = img.getAttribute('src');
          if (src && (src.startsWith('/') || src.startsWith('./') || src.startsWith('../'))) {
            try {
              img.src = new URL(src, baseUrl).href;
            } catch (e) {
              // ignore
            }
          }
        });

        const links = processingContainer.querySelectorAll('a');
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('../'))) {
            try {
              link.href = new URL(href, baseUrl).href;
            } catch (e) {
              // ignore
            }
          }
        });

        return {
          html: processingContainer.innerHTML,
          text: processedText || selection.toString()
        };
      }
    }, (results: any) => {
      if (browserAPI.runtime.lastError) {
        console.log('Script execution failed:', browserAPI.runtime.lastError.message);
        saveAndOpenEdit(initialSelection, pageUrl, activeTab.title || '', '');
        return;
      }

      let textToUse = initialSelection;
      let htmlToUse = '';

      if (results && results[0] && results[0].result) {
        const result = results[0].result;
        textToUse = result.text || initialSelection;
        htmlToUse = result.html || '';
      }

      saveAndOpenEdit(textToUse, pageUrl, activeTab.title || '', htmlToUse);
    });
  });
}

function showNotification(title: string, message: string) {
  browserAPI.notifications.create({
    type: "basic",
    iconUrl: "/icon.png",
    title: title,
    message: message
  });
}