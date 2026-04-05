import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, accessToken } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '請提供提示詞' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    // 呼叫 GeminiGen AI API
    const response = await fetch('https://api.geminigen.ai/uapi/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: 'image',
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.detail?.error_message || '生成失敗' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 根據實際 API 回應格式調整
    const imageUrl = data.image_url || data.url || data.result?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: '無法取得圖片 URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      data,
    });

  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
