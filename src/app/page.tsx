'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import SchoolIcon from '@mui/icons-material/School';
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, provider } from './firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from './authcontext';
import Image from 'next/image';
import { grey } from '@mui/material/colors';

export default function Home() {
  const router = useRouter();
  const { user,logout} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const msgEndRef: any = useRef(null);

  const scrollToBottom = () => {
    if (msgEndRef.current)
      msgEndRef.current.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      const result = await signInWithPopup(auth, provider);
      setIsLoading(false)
      router.push('/home');
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const GoogleLogo = (props: any) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 775 794"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M775 405.797C775 373.248 772.362 349.496 766.653 324.865H395.408V471.773H613.32C608.929 508.282 585.204 563.264 532.482 600.209L531.743 605.127L649.124 696.166L657.256 696.979C731.943 627.921 775 526.315 775 405.797"
            fill="#4285F4"
        />
        <path
            d="M395.408 792.866C502.167 792.866 591.792 757.676 657.256 696.979L532.482 600.209C499.093 623.521 454.279 639.796 395.408 639.796C290.845 639.796 202.099 570.741 170.463 475.294L165.826 475.688L43.772 570.256L42.1759 574.698C107.198 704.013 240.758 792.866 395.408 792.866Z"
            fill="#34A853"
        />
        <path
            d="M170.463 475.294C162.116 450.662 157.285 424.269 157.285 397C157.285 369.728 162.116 343.338 170.024 318.706L169.803 313.46L46.2193 217.373L42.1759 219.299C15.3772 272.961 0 333.222 0 397C0 460.778 15.3772 521.036 42.1759 574.698L170.463 475.294"
            fill="#FBBC05"
        />
        <path
            d="M395.408 154.201C469.656 154.201 519.74 186.31 548.298 213.143L659.891 104.059C591.356 40.2812 502.167 1.13428 395.408 1.13428C240.758 1.13428 107.198 89.9835 42.1759 219.299L170.024 318.706C202.099 223.259 290.845 154.201 395.408 154.201"
            fill="#EB4335"
        />
    </svg>
)
  
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
      }}
    >
      <Image
        fill
        src="/images/ai-chatgpt-teacher.jpg"
        alt="Image alt"
        style={{ objectFit: "cover"}}
      />
      <div style={{backgroundColor: "#0f0f0fb0", zIndex: 100, borderRadius: 50}}>
        <Box textAlign="center" m={4}>
          <SchoolIcon></SchoolIcon><Typography variant="h4" component="h1">
              ProfInsight
            </Typography>
            <Typography variant="h6" component="h6">
              Rate my professor AI assistant
            </Typography> 
          <Typography variant="h5" component="h1" mt={5}>
              Welcome
            </Typography>
            <Stack spacing={2} mt={2}
              alignItems="center" 
              sx={{ width: 'auto' }}
              >
                <Button variant="contained"
                  startIcon={<GoogleLogo />}
                  onClick={signInWithGoogle}
                  disabled={isLoading}
                  sx={{ width: 'auto', padding: '8px 16px' }}
                >
                  {isLoading ? 'Signing in....' : 'Sign in with Google'}
                </Button>
            </Stack>
        </Box>
        
      </div>
      
    </Box>
  )
}