import { useState, useEffect, useRef } from 'react'
import { Sparkles, Check, Loader2, Minimize2, Zap } from 'lucide-react'
import clsx from 'clsx'

interface Step {
  action: string;
  target?: string;
  query?: string;
}

interface Plan {
  goal: string;
  steps: Step[];
}

function App() {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.ipcRenderer.on('plan-generated', (_event, generatedPlan: Plan) => {
      setPlan(generatedPlan)
      setCurrentStep(-1)
      setCompletedSteps([])
    })

    window.ipcRenderer.on('step-started', (_event, data: { index: number, step: Step }) => {
      setCurrentStep(data.index)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.ipcRenderer.on('step-completed', (_event, data: { index: number, result: any }) => {
      setCompletedSteps(prev => [...prev, data.index])
      if (plan && data.index === plan.steps.length - 1) {
        setProcessing(false)
      }
    })

    return () => {
      window.ipcRenderer.off('plan-generated')
      window.ipcRenderer.off('step-started')
      window.ipcRenderer.off('step-completed')
    }
  }, [plan])

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || processing) return

    setProcessing(true)
    setPlan(null)
    setCompletedSteps([])
    setCurrentStep(-1)

    await window.ipcRenderer.invoke('execute-command', input)
    setInput('')
  }

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 w-16 h-16 bg-black/60 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 border border-white/10 group" onClick={() => setExpanded(true)}>
        <Sparkles className="text-white w-6 h-6 group-hover:text-blue-400 transition-colors" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[32rem] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="font-semibold tracking-wide">Sky</span>
        </div>
        <button onClick={() => setExpanded(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white">
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {plan && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-white/50 px-1 uppercase tracking-wider font-semibold">Executing Plan</div>
            {plan.steps.map((step, index) => {
              const isCurrent = currentStep === index
              const isCompleted = completedSteps.includes(index)
              const isPending = !isCurrent && !isCompleted

              return (
                <div key={index} className={clsx(
                  "p-3 rounded-xl flex items-center gap-3 transition-all duration-300",
                  isCurrent ? "bg-blue-500/10 border border-blue-500/20" : "bg-white/5 border border-white/5",
                  isPending && "opacity-50"
                )}>
                  <div className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                    isCompleted ? "bg-green-500/20 text-green-400" : isCurrent ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/50"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3" /> : isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {step.action.replace('_', ' ')}
                    </span>
                    {(step.target || step.query) && (
                      <span className="text-xs text-white/50">
                        {step.target || step.query}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!plan && !processing && (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-4">
            <Sparkles className="w-12 h-12 opacity-20" />
            <p className="text-sm text-center px-8">I am your local-first companion.<br/>What would you like me to do?</p>
            <div className="flex flex-col gap-2 w-full mt-4">
               <div className="text-xs text-white/30 px-2">Try saying:</div>
               <button onClick={() => setInput("open chrome and play latest MKBHD video")} className="text-left text-xs bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5 text-white/70">"open chrome and play latest MKBHD video"</button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-black/40">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={processing}
            placeholder={processing ? "Executing..." : "Ask Sky..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || processing}
            className="absolute right-2 p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg disabled:opacity-50 transition-colors"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
