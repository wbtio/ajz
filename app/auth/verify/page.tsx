import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <Container className="max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              تحقق من بريدك الإلكتروني
            </h1>
            <p className="text-gray-500 mb-6">
              لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى النقر على الرابط لتفعيل حسابك.
            </p>
            <Link href="/auth/login">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
