<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { SYSTEM_PROMPT, buildUserPrompt, type UserPromptParams } from './prompts'
import { extractHtml, postProcessHtml } from './html-utils'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

const conceptName = ref('')
const subject = ref('')
const conceptOverview = ref('')
const designIdea = ref('')
const keyPoints = ref('')

const isGenerating = ref(false)
const generatedHtml = ref('')
const errorMessage = ref('')

const scientificModel = reactive({
  core_formulas: [] as string[],
  mechanism: [] as string[],
  constraints: [] as string[],
  forbidden_errors: [] as string[]
})

async function generateInteractiveHtml() {
  if (!apiKey) {
    errorMessage.value = '请先在.env.local文件中配置OPENAI_API_KEY'
    return
  }

  isGenerating.value = true
  errorMessage.value = ''
  generatedHtml.value = ''

  try {
    const openai = createOpenAI({ apiKey })

    const keyPointsArray = keyPoints.value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p)

    const keyPointsText = keyPointsArray
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n')

    const userPromptParams: UserPromptParams = {
      conceptName: conceptName.value,
      subject: subject.value,
      conceptOverview: conceptOverview.value,
      keyPointsText,
      coreFormulas: scientificModel.core_formulas.join('; '),
      mechanisms: scientificModel.mechanism.join('; '),
      constraints: scientificModel.constraints.join('; '),
      forbiddenErrors: scientificModel.forbidden_errors.join('; '),
      designIdea: designIdea.value
    }

    const userPrompt = buildUserPrompt(userPromptParams)

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    const rawHtml = extractHtml(result.text)
    const processedHtml = postProcessHtml(rawHtml)
    generatedHtml.value = processedHtml

  } catch (error) {
    console.error('Generation error:', error)
    errorMessage.value = `生成失败: ${error instanceof Error ? error.message : '未知错误'}`
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">
        交互式HTML生成器
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-6 text-gray-700">输入信息</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                概念名称 *
              </label>
              <input
                v-model="conceptName"
                type="text"
                placeholder="例如：牛顿第二定律"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                学科 *
              </label>
              <input
                v-model="subject"
                type="text"
                placeholder="例如：物理学"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                概念概述 *
              </label>
              <textarea
                v-model="conceptOverview"
                rows="3"
                placeholder="简要描述这个概念..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                关键点 (每行一个) *
              </label>
              <textarea
                v-model="keyPoints"
                rows="4"
                placeholder="力与加速度成正比&#10;质量与加速度成反比&#10;F=ma公式"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                交互设计思路 *
              </label>
              <textarea
                v-model="designIdea"
                rows="3"
                placeholder="通过滑块调节力和质量，实时显示加速度变化"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <button
              @click="generateInteractiveHtml"
              :disabled="isGenerating"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ isGenerating ? '生成中...' : '生成交互式HTML' }}
            </button>

            <div
              v-if="errorMessage"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-6 text-gray-700">预览</h2>

          <div v-if="!generatedHtml" class="text-center py-20 text-gray-400">
            <svg
              class="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>生成的交互式HTML将在这里显示</p>
          </div>

          <div v-else class="h-full">
            <iframe
              :srcdoc="generatedHtml"
              class="w-full h-[600px] border-0 rounded-lg"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            ></iframe>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">使用说明</h2>
        <div class="space-y-2 text-gray-600">
          <p>1. 在左侧表单中填写概念信息</p>
          <p>2. 点击"生成交互式HTML"按钮</p>
          <p>3. 等待AI生成交互式页面</p>
          <p>4. 在右侧预览中查看和交互</p>
          <p class="text-sm text-gray-500 mt-4">
            注意：请确保在.env.local文件中配置了有效的OPENAI_API_KEY
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
