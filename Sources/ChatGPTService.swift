import Foundation

final class ChatGPTService {
    static let shared = ChatGPTService()
    private init() {}

    // ضع مفتاح API في مكان آمن مثل Keychain أو متغير بيئة أثناء التطوير
    private let apiKey: String = "<PUT_YOUR_API_KEY_HERE>"

    private let apiURL = URL(string: "https://api.openai.com/v1/chat/completions")!
    private let model = "gpt-4o-mini"

    enum ServiceError: Error {
        case missingAPIKey
        case requestFailed(String)
        case decodingFailed
    }

    func sendMessage(system: String, user: String, maxTokens: Int = 800, completion: @escaping (Result<String, Error>) -> Void) {
        guard apiKey != "<PUT_YOUR_API_KEY_HERE>" && !apiKey.isEmpty else {
            completion(.failure(ServiceError.missingAPIKey))
            return
        }

        let messages: [[String: String]] = [
            ["role": "system", "content": system],
            ["role": "user", "content": user]
        ]

        let payload: [String: Any] = [
            "model": model,
            "messages": messages,
            "max_tokens": maxTokens,
            "temperature": 0.2
        ]

        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])
        } catch {
            completion(.failure(error))
            return
        }

        let task = URLSession.shared.dataTask(with: request) { data, _, error in
            if let err = error {
                completion(.failure(err))
                return
            }
            guard let data = data else {
                completion(.failure(ServiceError.requestFailed("No data returned")))
                return
            }

            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let choices = json["choices"] as? [[String: Any]],
                   let first = choices.first,
                   let message = first["message"] as? [String: Any],
                   let content = message["content"] as? String {
                    completion(.success(content.trimmingCharacters(in: .whitespacesAndNewlines)))
                } else if let text = String(data: data, encoding: .utf8) {
                    completion(.success(text))
                } else {
                    completion(.failure(ServiceError.decodingFailed))
                }
            } catch {
                completion(.failure(error))
            }
        }
        task.resume()
    }
}
