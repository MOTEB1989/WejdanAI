import Foundation

enum ChatRole: String, Codable {
    case user
    case assistant
    case system
}

struct ChatMessage: Identifiable, Codable {
    let id: String
    let role: ChatRole
    let content: String
    let timestamp: Date
}
