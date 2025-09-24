import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Phone, ShieldCheck } from 'lucide-react'
import { authApi } from '@/lib/auth-api'
import { learningCentersPublicApi } from '@/lib/learning-centers-public-api'
import { useAuthStore } from '@/stores/auth-store'
import { useCountdown } from '@/hooks/use-countdown'
import { getStaticUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const phoneSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+998\d{9}$/, 'Please enter a valid Uzbek phone number (+998XXXXXXXXX)'),
  learning_center_id: z.number().min(1, 'Please select a learning center'),
})

const codeSchema = z.object({
  code: z.string()
    .min(6, 'Verification code must be 6 digits')
    .max(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type CodeFormData = z.infer<typeof codeSchema>

export function Login() {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null)
  const navigate = useNavigate()
  const { auth, phoneVerification } = useAuthStore()

  // Fetch learning centers
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers-public'],
    queryFn: () => learningCentersPublicApi.list(),
  })

  // Countdown timer for retry logic
  const { isActive, start, formatTime } = useCountdown({
    initialTime: phoneVerification.getWaitTime(),
    onComplete: () => {
      // Timer completed, user can retry
    }
  })

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
      learning_center_id: 0,
    }
  })

  // Code form
  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: '',
    }
  })

  // Start countdown on mount if there's wait time
  useEffect(() => {
    const waitTime = phoneVerification.getWaitTime()
    if (waitTime > 0) {
      start(waitTime)
    }
  }, [phoneVerification, start])

  const onSendCode = async (data: PhoneFormData) => {
    if (!phoneVerification.canRetry()) {
      toast.error(`Please wait ${formatTime()} before requesting another code`)
      return
    }

    setIsLoading(true)
    try {
      await authApi.sendCode({
        phone: data.phone,
        learning_center_id: data.learning_center_id
      })
      
      setPhoneData(data)
      phoneVerification.incrementRetryCount()
      start(phoneVerification.getWaitTime())
      setStep('code')
      toast.success('Verification code sent to your phone!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyCode = async (data: CodeFormData) => {
    if (!phoneData) return

    setIsLoading(true)
    try {
      const response = await authApi.verifyLogin({
        phone: phoneData.phone,
        code: data.code,
        learning_center_id: phoneData.learning_center_id
      })
      
      auth.setUser(response.user)
      auth.setTokens(response.access_token, response.refresh_token)
      phoneVerification.clearRetryData()
      
      toast.success('Login successful!')
      navigate({ to: '/' })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = () => {
    if (phoneData && phoneVerification.canRetry()) {
      onSendCode(phoneData)
    }
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setPhoneData(null)
    codeForm.reset()
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your phone number and select your learning center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learning_center_id">Learning Center</Label>
                <Select
                  value={phoneForm.watch('learning_center_id')?.toString() || ''}
                  onValueChange={(value) => phoneForm.setValue('learning_center_id', parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select learning center" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        <div className="flex items-center gap-2">
                          {center.logo && (
                            <img 
                              src={getStaticUrl(center.logo) || ''} 
                              alt={center.name}
                              className="w-4 h-4 rounded-full object-cover"
                              onError={(e) => {
                                // Hide image if it fails to load
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {center.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {phoneForm.formState.errors.learning_center_id && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.learning_center_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998901234567"
                  {...phoneForm.register('phone')}
                  disabled={isLoading}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {phoneVerification.retryCount > 0 && isActive && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Wait {formatTime()} to request new code
                  </Badge>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !phoneVerification.canRetry()}
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify Code
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to {phoneData?.phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                {...codeForm.register('code')}
                disabled={isLoading}
                autoFocus
              />
              {codeForm.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {codeForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>

            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendCode}
                disabled={isLoading || !phoneVerification.canRetry()}
                className="w-full"
              >
                {isActive ? `Resend Code (${formatTime()})` : 'Resend Code'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleBackToPhone}
                disabled={isLoading}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}