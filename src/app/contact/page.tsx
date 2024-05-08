import { ContactForm } from '@/components/contact-form'

const ContactPage = () => {
  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tighter text-rosewater">
          Get in touch
        </h2>
        <p className="text-text">
          Feel free to reach out and provide feedback, hire me or even just give
          a friendly hello
        </p>
      </div>

      <ContactForm />
    </div>
  )
}

export default ContactPage
