import React, { useState, useEffect, useRef } from "react";
import send from "../assets/send.svg";
import logo from "../assets/indpro.svg";
import "./ChatBox.css";

export const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        text: inputValue,
        timestamp: formatDate(new Date()),
        isUser: true,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue("");
      setIsLoading(true);

      const payload = {
        prompt: inputValue,
        chat_history: messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
      };

      try {
        const response = await fetch(
          "https://aat7sty0nd.execute-api.eu-north-1.amazonaws.com/Prod/llm/prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            mode: "cors",
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(
            `Server error: ${response.statusText} - ${errorMessage}`
          );
        }

        const data = await response.json();
        const assistantResponse = data.chat_answers_history[0];
        const updatedChatHistory = data.chat_history;

        const responseMessage = {
          text: assistantResponse,
          timestamp: formatDate(new Date()),
          isUser: false,
        };

        setMessages((prevMessages) => [...prevMessages, responseMessage]);
        setChatHistory(updatedChatHistory);
      } catch (error) {
        console.error("Error sending message:", error.message);
        // Provide feedback to the user about the error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-full lg:max-w-6xl rounded-lg p-6 lg:p-12 h-[80vh] lg:h-[100vh]">
        <div className="h-16 flex items-center justify-between">
          <header className="flex items-center space-x-4">
            <img
              src={logo}
              alt="tretti Chat Assistant"
              className="w-10 h-10 lg:w-12 lg:h-12 logo"
            />
            <div className="chat-text font-jost text-sm font-semibold lg:text-sm">
              Chat Assistant
            </div>
          </header>
        </div>
        <div className="flex flex-col space-y-4 overflow-auto h-2/3 p-2 hide-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-lg p-2 max-w-xs lg:max-w-sm ${
                  message.isUser
                    ? "bg-[#547c74] text-white"
                    : "bg-[#547c74] text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs mt-1 text-[#547c74]-500">
                {message.timestamp}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message-container mb-2 flex flex-col items-start">
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="relative mt-4">
          <input
            type="text"
            className="w-full p-4 lg:p-6 pr-10 border border-gray-300 rounded-full text-sm"
            placeholder="Ask me anything about your brand ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSendMessage}
            style={{ height: "48px" }} // Adjust the height here as needed
          />
          <button
            onClick={sendMessage}
            className="absolute inset-y-0 right-4 flex items-center pr-3 focus:outline-none"
          >
            <img src={send} alt="Send" className="w-6 h-6" />
          </button>
        </div>
        <footer className="mt-4 lg:mt-20 text-center text-xs text-gray-500">
          Powered by <span className="font-bold">INDPRO</span>
        </footer>
      </div>
    </div>
  );
};
