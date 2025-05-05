import type React from "react"
interface FormProgressProps {
  currentStep: number
  steps: { id: string; title: string; component: React.ReactNode }[]
}

export function FormProgress({ currentStep, steps }: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 text-center ${index === currentStep ? "text-[#58317A] font-bold" : "text-gray-400"}`}
          >
            <div className="hidden md:block text-sm">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-6 h-6 rounded-full flex items-center justify-center z-10
                ${index <= currentStep ? "bg-[#58317A] text-white" : "bg-gray-200 text-gray-400"}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
