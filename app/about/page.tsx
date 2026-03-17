import { redirect } from 'next/navigation'

export const metadata = {
  title: 'About Us | JAZ',
  description: 'Learn about JAZ, our vision, mission, and commitment to organizing world-class events and exhibitions in Iraq',
}

export default function AboutPage() {
  redirect('/')
}
