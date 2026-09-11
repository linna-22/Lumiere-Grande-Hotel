import {
  User,
  CalendarDays,
  BedDouble,
  CreditCard,
  Check,
} from 'lucide-react'

const steps = [
  {
    number: 1,
    label: 'Guest',
    icon: User,
  },
  {
    number: 2,
    label: 'Stay',
    icon: CalendarDays,
  },
  {
    number: 3,
    label: 'Room',
    icon: BedDouble,
  },
  {
    number: 4,
    label: 'Payment',
    icon: CreditCard,
  },
]

export default function ReservationStepper({
  currentStep,
  onStepClick,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">

        {steps.map((step, index) => {
          const Icon = step.icon

          const completed = currentStep > step.number
          const active = currentStep === step.number
          const clickable = step.number < currentStep

          return (
            <div
              key={step.number}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={() => {
                  if (clickable) {
                    onStepClick?.(step.number)
                  }
                }}
                className={`flex flex-col items-center gap-2 group ${
                  clickable
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                    completed
                      ? 'bg-amber-400 border-amber-400 text-base-950'
                      : active
                        ? 'bg-amber-400 border-amber-400 text-base-950'
                        : 'bg-base-800 border-base-border text-slate-500'
                  }`}
                >
                  {completed ? (
                    <Check
                      size={18}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>

                <span
                  className={`text-xs sm:text-sm font-medium ${
                    active || completed
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-3 sm:mx-5 mt-[-22px] transition-colors ${
                    currentStep > step.number
                      ? 'bg-amber-400'
                      : 'bg-base-border'
                  }`}
                />
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}