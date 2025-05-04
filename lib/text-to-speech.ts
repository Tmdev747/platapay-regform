export async function textToSpeech(text: string, voiceId?: string) {
  try {
    const voice = voiceId || process.env.ELEVEN_LABS_VOICE_ID

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error("Text-to-speech error:", error)
    throw error
  }
}

export async function getVoices() {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const data = await response.json()
    return data.voices
  } catch (error) {
    console.error("Error fetching voices:", error)
    throw error
  }
}
