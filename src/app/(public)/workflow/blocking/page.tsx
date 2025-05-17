import WorkflowBlocking from "@/components/WorkflowBlocking"


export default function WorkflowBlockingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-4xl w-full">
            <h1 className="text-4xl font-bold mb-8 text-center">Dify Workflow Blocking API demo</h1>
            <WorkflowBlocking />
        </div>
        
    </main>
  )
}
