import { Input } from "../ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FaFacebook,  FaHeartbeat ,FaInstagram , FaLinkedinIn,  } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function NewsletterSection() {
    return (
      <section className="max-w-full flex justify-center items-center py-6 md:py-12 lg:py-5 bg-zinc-800">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center">
            <FaHeartbeat className="h-8 w-8 text-pink-500 mr-2 animate-pulse" />
            <h2 className="text-xl font-semibold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl/none text-sky-300">
              Heart Health Updates
            </h2>
          </div>
          <p className="mx-auto max-w-[700px] text-blue-100 md:text-lg mb-6">
            Subscribe to our newsletter for the latest cardiovascular research, treatment options, and heart-healthy
            lifestyle tips.
          </p>
          <div className="w-full max-w-md space-y-2 my-4">
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400 focus-visible:ring-sky-400"
                aria-label="Email address"
              />
              <Button
                type="submit"
                variant="outline"
                className="text-sky-300 border-sky-400 hover:bg-sky-400 hover:text-zinc-900"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-sky-200/70 mt-2">
              We respect your privacy. Your information will never be shared with third parties.
            </p>
          </div>
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="#" aria-label="Facebook page" className="text-sky-300 hover:text-blue-500 transition-colors">
              <FaFacebook className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="Twitter profile" className="text-sky-300 hover:text-white transition-colors">
              <FaSquareXTwitter className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="Instagram profile" className="text-sky-300 hover:text-pink-400 transition-colors">
              <FaInstagram className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="LinkedIn profile" className="text-sky-300 hover:text-sky-400 transition-colors">
              <FaLinkedinIn className="h-6 w-6" />
            </Link>
          </div>
          <div className="mt-8 p-4 bg-zinc-700 rounded-lg border border-sky-900/50 max-w-md">
            <h3 className="font-medium text-sky-400 mb-2">Join our cardiovascular community</h3>
            <p className="text-sm text-blue-100">
              Connect with healthcare professionals, patients, and advocates dedicated to cardiovascular health and
              wellness.
            </p>
          </div>
        </div>
      </section>
    )
  }
  