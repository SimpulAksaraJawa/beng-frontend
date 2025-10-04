import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router';

export default function error()  {
    const navigate = useNavigate();
  return (
    <div className="h-dvh flex flex-col gap-2 items-center justify-center w-full bg-gradient-to-b from-[#8ECAE6] to-white mb-4">
        <h1 className = "text-9xl font-bold">3RR0R!</h1>
        <p className = "text-xl font-semibold mb-4">The page you are looking for does not exist.</p>
        <Button variant="secondary" className='cursor-pointer text-md' onClick={()=>{navigate("/product")}}>
            Return to home
        </Button>
    </div>
  )
}
