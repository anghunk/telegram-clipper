import { defineBackground } from 'wxt/sandbox';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('一键TG频道助手 - 后台服务启动', { id: browser.runtime.id });
  
  // 从环境变量获取默认配置
  const envBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envChannelId = import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '';
  
  // Create context menu when extension is installed
  browser.runtime.onInstalled.addListener(() => {
    // Parent menu
    browser.contextMenus.create({
      id: "telegramParent",
      title: "一键TG频道助手",
      contexts: ["all"]
    });

    // Child menu: Send selected text
    browser.contextMenus.create({
      id: "sendToTelegram",
      parentId: "telegramParent",
      title: "⚡ 发送选中文字",
      contexts: ["selection"]
    });

    // Child menu: Edit before sending
    browser.contextMenus.create({
      id: "editBeforeSend",
      parentId: "telegramParent",
      title: "✏️ 编辑后发送",
      contexts: ["selection"]
    });

    // Child menu: Bookmark page
    browser.contextMenus.create({
      id: "bookmarkPage",
      parentId: "telegramParent",
      title: "🔖 收藏网址",
      contexts: ["page"]
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToTelegram" && info.selectionText) {
      getSelectionWithLineBreaks(tab, (text) => {
        sendToTelegram(text || info.selectionText || '');
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
    } else if (request.action === 'sendToTelegram') {
      sendToTelegram(request.text);
      sendResponse({ success: true });
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

function sendToTelegram(text: string) {
  browserAPI.storage.sync.get(["telegramBotToken", "telegramChannelId"], (items: any) => {
    // 优先使用存储中的值，如果没有则使用环境变量
    const envBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
    const envChannelId = import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '';
    
    const token = items.telegramBotToken || envBotToken;
    const chatId = items.telegramChannelId || envChannelId;

    if (!token || !chatId) {
      showNotification("配置缺失", "请先在扩展选项中设置 Bot Token 和 Channel ID");
      browserAPI.runtime.openOptionsPage();
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const data = {
      chat_id: chatId,
      text: text
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.ok) {
          showNotification("发送成功", "消息已发送到 Telegram");
        } else {
          console.error("Telegram API Error:", JSON.stringify(result, null, 2));
          let errorMsg = "未知错误";
          if (result.description) {
            errorMsg = result.description;
          } else if (result.error_code) {
            errorMsg = `错误代码: ${result.error_code}`;
          }
          showNotification("发送失败", errorMsg);
        }
      })
      .catch(error => {
        console.error("Network Error:", error);
        showNotification("发送失败", "网络错误或无法连接到 Telegram API");
      });
  });
}

function bookmarkPage(tab: any) {
  const title = tab.title || "无标题";
  const url = tab.url || "";
  const message = `${title}\n\n${url}`;
  sendToTelegram(message);
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
        height: 600
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