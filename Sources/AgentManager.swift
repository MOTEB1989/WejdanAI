import Combine
import Foundation

final class AgentManager: ObservableObject {
    static let shared = AgentManager()
    private init() {}

    @Published var messages: [ChatMessage] = []
    @Published var isLoading: Bool = false

    private let systemPrompt: String = {
        // يمكنك تحميل AgentInstructions.md من المستودع أو تضمينه هنا
        return """
        أنت وكيل برمجي متقدم داخل مشروع دردشة iOS. كن دقيقا ومنظما...
        (ضع هنا نص AgentInstructions.md الكامل أو حمّله ديناميكياً)
        """
    }()

    func send(userText: String) {
        let userMessage = userText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !userMessage.isEmpty else { return }

        let userChat = ChatMessage(id: UUID().uuidString, role: .user, content: userMessage, timestamp: Date())
        messages.append(userChat)
        isLoading = true

        ChatGPTService.shared.sendMessage(system: systemPrompt, user: userMessage) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success(let text):
                    let assistant = ChatMessage(id: UUID().uuidString, role: .assistant, content: text, timestamp: Date())
                    self?.messages.append(assistant)
                case .failure(let error):
                    let errMsg = "خطأ في الاتصال: \(error.localizedDescription)"
                    let assistant = ChatMessage(id: UUID().uuidString, role: .assistant, content: errMsg, timestamp: Date())
                    self?.messages.append(assistant)
                }
            }
        }
    }
}
