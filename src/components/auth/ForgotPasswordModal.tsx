import { useState } from 'react';
import { X, Mail, Lock, Shield, Loader2, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { forgotPassword, verifyOtp, resetPassword } = useAuthStore();

  const [showNotification, setShowNotification] = useState(false);

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setDemoOtp('');
    setResetSuccess(false);
    setLoading(false);
    setShowNotification(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const result = await forgotPassword(email);
        if (result.success) {
          toast.success(`OTP sent to ${email}`);
          if (result.otp) {
            setDemoOtp(result.otp);
            setShowNotification(true); // Trigger the email simulation toast
          }
          setStep('otp');
        } else {
          toast.error(result.message || 'Failed to send OTP');
        }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/\d/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      setLoading(false);
      return;
    }

    try {
      const isValid = await verifyOtp(email, otpString);
      if (isValid) {
        toast.success('OTP verified successfully!');
        setStep('password');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const success = await resetPassword(email, newPassword);
      if (success) {
        toast.success('Password has been reset successfully! 🎉');
        setResetSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      toast.error('Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              {step === 'email' && <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              {step === 'otp' && <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              {step === 'password' && <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 'email' && 'Forgot Password'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'password' && 'Set New Password'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === 'email' && 'Enter your email to receive OTP'}
                {step === 'otp' && 'Enter the 6-digit code sent to your email'}
                {step === 'password' && 'Create a new secure password'}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 gap-2">
            <div className={`w-8 h-1 rounded-full ${step === 'email' ? 'bg-blue-600' : 'bg-blue-600'}`} />
            <div className={`w-8 h-1 rounded-full ${step === 'email' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600'}`} />
            <div className={`w-8 h-1 rounded-full ${step === 'password' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success State */}
          {resetSuccess && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Password Reset Complete!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Redirecting to login...
              </p>
            </div>
          )}

          {/* Step 1: Email */}
          {!resetSuccess && step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

           {/* Step 2: OTP Verification */}
           {!resetSuccess && step === 'otp' && (
             <form onSubmit={handleVerifyOtp} className="space-y-5">
               {/* Email Sent Message */}
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                 <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                   ✅ We've sent a 6-digit verification code to<br />
                   <span className="font-medium text-emerald-800 dark:text-emerald-200">{email}</span>
                 </p>
               </div>

               {/* Demo Helper - Only show if user wants to see it */}
               {demoOtp && (
                 <div className="text-center">
                   <button
                     type="button"
                     onClick={() => {
                       const otpArray = demoOtp.split('');
                       setOtp(otpArray);
                       toast.success('Demo OTP auto-filled!');
                     }}
                     className="text-xs px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                   >
                     📋 Use Demo OTP: {demoOtp}
                   </button>
                 </div>
               )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Resend
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {!resetSuccess && step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 6 ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {newPassword.length < 6 && 'Too short'}
                    {newPassword.length >= 6 && newPassword.length < 8 && 'Weak'}
                    {newPassword.length >= 8 && !/[A-Z]/.test(newPassword) && 'Medium'}
                    {newPassword.length >= 10 && /[A-Z]/.test(newPassword) && 'Strong'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            🔒 Your data is securely encrypted and never shared
          </p>
        </div>
      </div>

      {/* 📩 Simulated Browser Email Notification */}
      {showNotification && demoOtp && (
        <div className="fixed top-5 right-5 z-[100] w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transform animate-slide-in-right flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  ✉️ Gmail Notification
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">TeamTrack Pro Support</p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Your Password Reset OTP is:</p>
            <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mt-1">{demoOtp}</p>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setOtp(demoOtp.split(''));
                setShowNotification(false);
                toast.success("OTP auto-filled!");
              }}
              className="text-xs font-medium py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Autofill Code
            </button>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-xs font-medium py-1.5 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
