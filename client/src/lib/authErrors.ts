
export function authErrorMessage(err: any): string {
  if (!err) return 'অপ্রত্যাশিত ত্রুটি হয়েছে। আবার চেষ্টা করুন।';

  const status = err?.status;
  const code = (err?.code || '').toLowerCase();
  const msg = (err?.message || '').toLowerCase();

  if (
    status === 429 ||
    code.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) {
    return 'ইমেইল পাঠানোর সীমা অতিক্রম হয়েছে। Supabase প্রতি ঘণ্টায় সীমিত সংখ্যক ইমেইল পাঠায় — কিছুক্ষণ (প্রায় ১ ঘণ্টা) পর আবার চেষ্টা করুন।';
  }

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।';
  }

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'ইমেইল কনফার্ম করা হয়নি। আপনার ইনবক্সে পাঠানো কনফার্মেশন লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন, তারপর লগইন করুন।';
  }

  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return 'এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট তৈরি হয়েছে। সরাসরি লগইন করুন অথবা পাসওয়ার্ড ভুলে গেলে "পাসওয়ার্ড ভুলে গেছেন" ব্যবহার করুন।';
  }

  if (code === 'weak_password' || msg.includes('password should be')) {
    return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে এবং যথেষ্ট শক্তিশালী হতে হবে।';
  }

  if (msg.includes('signups not allowed') || msg.includes('not allowed for this instance')) {
    return 'নতুন রেজিস্ট্রেশন বর্তমানে বন্ধ আছে। লাইব্রেরি অ্যাডমিনের সাথে যোগাযোগ করুন।';
  }

  if (msg.includes('confirmation email')) {
    return 'কনফার্মেশন ইমেইল পাঠানো হয়েছে। ইনবক্স চেক করুন (স্প্যাম ফোল্ডারও দেখুন)।';
  }

  if (msg.includes('resend') || code === 'resend') {
    return 'ইমেইল পুনরায় পাঠানোর জন্য ৬০ সেকেন্ড অপেক্ষা করুন।';
  }

  if (msg.includes('ticket') || msg.includes('support')) {
    return err.message || 'সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
  }

  return err?.message || 'অপ্রত্যাশিত ত্রুটি হয়েছে। আবার চেষ্টা করুন।';
}