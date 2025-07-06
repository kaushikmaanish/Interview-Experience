// import { ChatInterface } from "@/components/chat-interface"

// export default function ChatPage() {
//   return (
//     <div className="container py-10">
//       <div className="mx-auto max-w-4xl space-y-6">
//         <div className="space-y-2">
//           <h1 className="text-3xl font-bold tracking-tight">Interview AI Assistant</h1>
//           <p className="text-muted-foreground">
//             Chat with our AI assistant to get help with your interview preparation. Ask questions about interview
//             processes, technical concepts, or get feedback on your answers.
//           </p>
//         </div>
//         <ChatInterface />
//       </div>
//     </div>
//   )
// }


import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="container py-10 px-4">
      <div className="mx-auto max-w-4xl sm:max-w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Interview AI Assistant</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chat with our AI assistant to get help with your interview preparation. Ask questions about interview
            processes, technical concepts, or get feedback on your answers.
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}
