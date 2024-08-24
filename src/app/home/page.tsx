'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import Image from 'next/image';

export default function Home() {
    const [messages, setMessages] = useState([
        {
          role: 'assistant',
          content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
        },
      ])
      const [message, setMessage] = useState('')
      const [isLoading, setIsLoading] = useState(false);

      const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          sendMessage()
        }
      }
      const sendMessage = async () => {
        if (!message.trim()) return;
        setIsLoading(true);
        setMessage('')
        setMessages((messages) => [
          ...messages,
          {role: 'user', content: message},
          {role: 'assistant', content: ''},
        ])
        try
        {
        const response = fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([...messages, {role: 'user', content: message}]),
        }).then(async (res:any) => {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let result = ''
      
          return reader.read().then(function processText({done, value}:any) {
            if (done) {
              return result
            }
            const text = decoder.decode(value || new Uint8Array(), {stream: true})
            setMessages((messages) => {
              let lastMessage = messages[messages.length - 1]
              let otherMessages = messages.slice(0, messages.length - 1)
              setIsLoading(false)
              return [
                ...otherMessages,
                {...lastMessage, content: lastMessage.content + text},
              ]
            })
            return reader.read().then(processText)
          })
        })
    }catch(error){
        console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
      setIsLoading(false)
    }
      }

      return (

        <Box
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          zIndex={-1}
        >
            <Image
        fill
        src="/images/ai.avif"
        alt="Image alt"
        style={{ objectFit: "cover"}}
      />
          <Stack
            direction={'column'}
            width="500px"
            height="700px"
            border="1px solid black"
            p={2}
            spacing={3}
            //bgcolor="rgba(255, 255, 255, 0.9)" // Slight background for the chat box to distinguish from background
            borderRadius={4} // Optional: adds rounded corners
            zIndex={1} // Ensure this is above the background image
            position="relative"
          >
            <Stack
              direction={'column'}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box
                    bgcolor={
                      message.role === 'assistant'
                        ? 'primary.main'
                        : 'secondary.main'
                    }
                    color="white"
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction={'row'} spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onKeyPress={handleKeyPress}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
              {isLoading ? 'Sending....' : 'Send'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )
      
  }