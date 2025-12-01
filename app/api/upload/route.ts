import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// 配置：增加请求体大小限制和超时时间
export const maxDuration = 60; // 最大执行时间 60 秒
export const dynamic = 'force-dynamic'; // 强制动态渲染

// POST /api/upload - 上传订阅内容到文件
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let content: string;
    let oldId: string | null = null;

    console.log(`[Upload] Start processing, content-type: ${contentType}`);

    // 只支持 JSON 格式（更快、更可靠）
    if (contentType.includes('application/json')) {
      const body = await request.json();
      content = body.content;
      oldId = body.oldId || null;
      
      console.log(`[Upload] JSON parsed in ${Date.now() - startTime}ms, content size: ${content?.length || 0} bytes`);
    } else {
      return NextResponse.json({
        Code: 0,
        Message: '请使用 JSON 格式上传（Content-Type: application/json）'
      });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({
        Code: 0,
        Message: '内容不能为空'
      });
    }

    const decodedContent = content;

    // 生成新的唯一 ID
    const newId = Math.random().toString(36).substring(2, 15);

    // 确保 subscriptions 文件夹存在
    const subsDir = join(process.cwd(), 'subscriptions');
    
    // 并行执行：创建目录和准备文件路径
    const [_] = await Promise.all([
      mkdir(subsDir, { recursive: true })
    ]);

    console.log(`[Upload] Directory ready in ${Date.now() - startTime}ms`);

    // 保存到新文件（使用 Buffer 可能更快）
    const newFilePath = join(subsDir, `${newId}.txt`);
    const writeStart = Date.now();
    await writeFile(newFilePath, decodedContent, 'utf-8');
    console.log(`[Upload] File written in ${Date.now() - writeStart}ms`);

    // 异步删除旧文件（不阻塞响应）
    if (oldId && oldId !== newId) {
      const oldFilePath = join(subsDir, `${oldId}.txt`);
      // 不等待删除完成，立即返回响应
      unlink(oldFilePath).catch(error => {
        console.warn(`Failed to delete old file ${oldId}.txt:`, error);
      });
    }

    // 生成订阅链接 URL
    // 优先使用环境变量配置的基础 URL，如果未设置则自动检测
    // 使用 BASE_URL（服务器端变量，更安全）
    let baseUrl = process.env.BASE_URL;
    
    if (baseUrl) {
      // 使用环境变量配置的 URL，移除末尾的斜杠
      baseUrl = baseUrl.replace(/\/$/, '');
      console.log(`Using BASE_URL from environment: ${baseUrl}`);
    } else {
      // 自动检测：优先使用 X-Forwarded-* 头（用于代理/反向代理场景）
      const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
      baseUrl = `${protocol}://${host}`;
      console.log(`Auto-detected base URL: ${baseUrl}`);
      console.log(`Headers - x-forwarded-proto: ${request.headers.get('x-forwarded-proto')}, x-forwarded-host: ${request.headers.get('x-forwarded-host')}, host: ${request.headers.get('host')}`);
    }
    
    // 返回 URL
    const url = `${baseUrl}/api/sub/${newId}`;
    const totalTime = Date.now() - startTime;
    console.log(`[Upload] Total time: ${totalTime}ms, URL: ${url}`);

    return NextResponse.json({
      Code: 1,
      Url: url,
      Message: oldId ? '更新成功' : '上传成功',
      ProcessTime: totalTime // 返回处理时间，便于调试
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[Upload] Error after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      Code: 0,
      Message: error instanceof Error ? error.message : '操作失败',
      ProcessTime: totalTime
    });
  }
}
