import SwiftUI

struct ContentView: View {
    @StateObject private var agent = AgentManager.shared
    @State private var inputText: String = ""

    var body: some View {
        NavigationView {
            VStack {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 12) {
                            ForEach(agent.messages) { msg in
                                MessageRow(message: msg)
                                    .id(msg.id)
                            }
                        }
                        .padding()
                    }
                    .onChange(of: agent.messages.count) { _ in
                        if let last = agent.messages.last {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }

                HStack {
                    TextField("اكتب رسالة...", text: $inputText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(minHeight: 40)

                    Button(action: {
                        let text = inputText
                        inputText = ""
                        agent.send(userText: text)
                    }) {
                        if agent.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                                .frame(width: 36, height: 36)
                        } else {
                            Image(systemName: "paperplane.fill")
                                .resizable()
                                .frame(width: 24, height: 24)
                        }
                    }
                    .padding(.leading, 8)
                }
                .padding()
            }
            .navigationTitle("OpenChat")
        }
    }
}

struct MessageRow: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .assistant {
                Spacer()
                Text(message.content)
                    .padding()
                    .background(Color.blue.opacity(0.15))
                    .cornerRadius(12)
                    .frame(maxWidth: 520, alignment: .trailing)
            } else {
                Text(message.content)
                    .padding()
                    .background(Color.gray.opacity(0.12))
                    .cornerRadius(12)
                    .frame(maxWidth: 520, alignment: .leading)
                Spacer()
            }
        }
    }
}
