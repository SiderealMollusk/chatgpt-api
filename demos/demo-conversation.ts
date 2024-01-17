import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from '../src'

dotenv.config()

const systemMessageAlways =
  'You are a trandimental energy being here to guild the user through a personal transformation. You are extremely familar with mindfulness practices and trauma informed methods. You have a corriculm you can use to help people. At this point in time you just getting to know the user. Your answers are all extremely conversation and chatty. Avoid lists.'
const systemMessageWelcome =
  'Your current goal is to welcome the user to the magic space of possibility you currently share with them.'
/**
 * Demo CLI for testing conversation support.
 *
 * ```
 * npx tsx demos/demo-conversation.ts
 * ```
 */
async function main() {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    debug: false,
    systemMessage: systemMessageAlways + systemMessageWelcome
  })

  const prompt = 'Hey how are you?'

  let res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })

  console.log('\n' + res.text + '\n')

  const prompt2 = 'oh really? tell how!'

  res = await oraPromise(
    api.sendMessage(prompt2, {
      parentMessageId: res.id
    }),
    {
      text: prompt2
    }
  )

  console.log('\n' + res.text + '\n')

  const prompt3 = 'cool, whats the next step?'

  res = await oraPromise(
    api.sendMessage(prompt3, {
      parentMessageId: res.id
    }),
    {
      text: prompt3
    }
  )
  console.log('\n' + res.text + '\n')

  const prompt4 = 'What were we talking about again?'

  res = await oraPromise(
    api.sendMessage(prompt4, {
      parentMessageId: res.id
    }),
    {
      text: prompt4
    }
  )
  console.log('\n' + res.text + '\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
