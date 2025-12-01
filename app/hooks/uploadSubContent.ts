/**
 * 上传订阅内容到服务器文件系统
 * @param content - The subscription content to upload
 * @param oldId - Optional old file ID to delete after creating new file
 * @returns Promise<string> - The URL where the content can be accessed
 * @throws Error if content is empty or upload fails
 */
export const uploadSubContent = async (content: string, oldId?: string): Promise<string> => {
  if (!content || !content.trim()) {
    throw new Error('请输入订阅内容');
  }

  const startTime = Date.now();
  console.log(`[Client] Starting upload, content size: ${content.length} bytes`);

  try {
    // 使用 JSON 格式直接发送原始内容（不使用 Base64 编码）
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        oldId: oldId,
      }),
    });

    const uploadTime = Date.now() - startTime;
    console.log(`[Client] Upload completed in ${uploadTime}ms, status: ${res.status}`);

    if (res.status === 200) {
      const data = await res.json();
      if (data.Code !== 1) {
        throw new Error(data.Message || '上传失败');
      }
      
      console.log(`[Client] Server processing time: ${data.ProcessTime}ms`);
      return data.Url;
    }

    throw new Error(`上传失败: HTTP ${res.status}`);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[Client] Upload failed after ${totalTime}ms:`, error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('上传订阅内容时发生未知错误');
  }
};
