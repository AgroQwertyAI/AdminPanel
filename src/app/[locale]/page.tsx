import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  Monitor, 
  BarChart3, 
  FileText, 
  Zap, 
  Users, 
  Shield, 
  MessageSquare, 
  Globe, 
  ChevronRight,
  Mail
} from 'lucide-react';
import LocaleSwitcher from '../components/LocaleSwitcher';

export default function Home() {
  const landingT = useTranslations('landing');
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-base-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto navbar px-4">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost text-xl gap-2">
              <Zap className="text-primary" />
              <span className="font-bold text-primary">QwertyAI</span>
            </Link>
          </div>
          
          <div className="flex-none">
            <LocaleSwitcher/>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-base-200 py-20">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-base-content">
              {landingT('hero.title.firstPart')} <span className="text-primary">{landingT('hero.title.highlight')}</span>
            </h1>
            <p className="text-lg text-base-content/70">
              {landingT('hero.description')}
            </p>
            <div className="flex gap-4">
              <Link href="/signin" className="btn btn-primary btn-lg">
                {landingT('hero.primaryCta')}
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md bg-base-100 p-6 rounded-xl shadow-xl">
              <div className=" border bg-base-300">
                <div className="px-4 py-8 bg-base-200 flex flex-col gap-4">
                  <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-primary">{landingT('hero.chatDemo.message1')}</div>
                  </div>
                  <div className="chat chat-end">
                    <div className="chat-bubble chat-bubble-accent">{landingT('hero.chatDemo.message2')}</div>
                  </div>
                  <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-primary">{landingT('hero.chatDemo.message3')}</div>
                  </div>
                  <div className="divider">{landingT('hero.chatDemo.processing')}</div>
                  <div className="alert alert-success shadow-lg">
                    <span>{landingT('hero.chatDemo.result')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-base-content">
            {landingT('features.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <Monitor className="w-12 h-12 text-primary mb-2" />
                <h3 className="card-title text-base-content text-xl">{landingT('features.cards.analysis.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('features.cards.analysis.description')}
                </p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <BarChart3 className="w-12 h-12 text-primary mb-2" />
                <h3 className="card-title text-base-content text-xl">{landingT('features.cards.insights.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('features.cards.insights.description')}
                </p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <FileText className="w-12 h-12 text-primary mb-2" />
                <h3 className="card-title text-base-content text-xl">{landingT('features.cards.reporting.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('features.cards.reporting.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-base-content">
            {landingT('howItWorks.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="badge badge-primary badge-lg mb-4">1</div>
                <h3 className="card-title text-base-content">{landingT('howItWorks.steps.connect.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('howItWorks.steps.connect.description')}
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="badge badge-primary badge-lg mb-4">2</div>
                <h3 className="card-title text-base-content">{landingT('howItWorks.steps.conversations.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('howItWorks.steps.conversations.description')}
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="badge badge-primary badge-lg mb-4">3</div>
                <h3 className="card-title text-base-content">{landingT('howItWorks.steps.ai.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('howItWorks.steps.ai.description')}
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="badge badge-primary badge-lg mb-4">4</div>
                <h3 className="card-title text-base-content">{landingT('howItWorks.steps.reports.title')}</h3>
                <p className="text-base-content/80">
                  {landingT('howItWorks.steps.reports.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Users className="w-8 h-8" />
                </div>
                <div className="stat-title">{landingT('stats.users.title')}</div>
                <div className="stat-value text-primary">10k+</div>
                <div className="stat-desc">{landingT('stats.users.description')}</div>
              </div>
            </div>
            
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="stat-title">{landingT('stats.conversations.title')}</div>
                <div className="stat-value text-primary">500k+</div>
                <div className="stat-desc">{landingT('stats.conversations.description')}</div>
              </div>
            </div>
            
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Globe className="w-8 h-8" />
                </div>
                <div className="stat-title">{landingT('stats.countries.title')}</div>
                <div className="stat-value text-primary">50+</div>
                <div className="stat-desc">{landingT('stats.countries.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-base-content">
            {landingT('contact.title')}
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h3 className="text-2xl text-base-content font-bold mb-6">{landingT('contact.getInTouch')}</h3>
              <p className="mb-8 text-base-content/80">
                {landingT('contact.description')}
              </p>
              
              <div className="space-y-4">
                <div className="text-base-content flex items-center">
                  <Mail className="w-6 h-6 text-primary mr-4" />
                  <span>support@qwertyai.com</span>
                </div>
                <div className="text-base-content flex items-center">
                  <Globe className="w-6 h-6 text-primary mr-4" />
                  <span>www.qwertyai.com</span>
                </div>
              </div>
            </div>
            
            <div className="text-base-content lg:w-1/2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <form>
                    <div className="form-control mb-4">

                      <input type="text" placeholder={landingT('contact.form.namePlaceholder')} className="input input-bordered" />
                    </div>
                    
                    <div className="form-control mb-4">

                      <input type="email" placeholder={landingT('contact.form.emailPlaceholder')} className="input input-bordered" />
                    </div>
                    
                    <div className="form-control mb-4">

                      <textarea className="textarea textarea-bordered h-24" placeholder={landingT('contact.form.messagePlaceholder')}></textarea>
                    </div>
                    
                    <div className="form-control mt-6">
                      <button type="submit" className="btn btn-primary">{landingT('contact.form.submit')}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{landingT('cta.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {landingT('cta.description')}
          </p>
          <Link href="/signin" className="btn btn-lg glass">
            <Shield className="mr-2" />
            {landingT('cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content py-10">
        <div className="container mx-auto px-4">
          <div className="footer p-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <span className="font-bold text-xl">QwertyAI</span>
              </div>
              <p className="text-neutral-content/70">
                {landingT('footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div> 
          </div>
        </div>
      </footer>
    </div>
  );
}