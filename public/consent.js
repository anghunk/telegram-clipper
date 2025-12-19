// 数据收集同意页面逻辑
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已经同意
  browserAPI.storage.local.get('data_consent', (result) => {
    if (result.data_consent === true) {
      // 已同意,跳转到选项页面
      window.location.href = browserAPI.runtime.getURL('options.html');
    }
  });

  // 接受按钮
  const acceptBtn = document.getElementById('acceptBtn');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      browserAPI.storage.local.set({ data_consent: true }, () => {
        // 保存同意状态后跳转到选项页
        window.location.href = browserAPI.runtime.getURL('options.html');
      });
    });
  }

  // 拒绝按钮
  const declineBtn = document.getElementById('declineBtn');
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      browserAPI.storage.local.set({ data_consent: false }, () => {
        // 显示拒绝提示
        alert('您已拒绝数据收集。扩展功能将无法正常使用,页面将关闭。');
        window.close();
      });
    });
  }
});
