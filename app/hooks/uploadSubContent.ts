import { encode } from 'js-base64';

/**
 * 上传订阅内容到本地文件系统
 * @param content - The subscription content to upload
 * @param oldId - Optional old file ID to delete after creating new file
 * @returns Promise<string> - The URL where the content can be accessed
 * @throws Error if content is empty or upload fails
 */
export const uploadSubContent = async (content: string, oldId?: string): Promise<string> => {
  if (!content || !content.trim()) {
    throw new Error('请输入订阅内容');
  }

  try {
    const formData = new FormData();
    formData.append('content', encode(content));
    if (oldId) {
      formData.append('oldId', oldId);
    }

    // 调用本地 API 上传到文件
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data.Code !== 1) {
        throw new Error(data.Message || '上传失败');
      }
      return data.Url;
    }

    throw new Error(`上传失败: HTTP ${res.status}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('上传订阅内容时发生未知错误');
  }
};
