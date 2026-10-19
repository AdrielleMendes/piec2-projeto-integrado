import React, { useState } from 'react'
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '../services/api'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [feedback, setFeedback] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setFeedback('')
    try {
      await api.createLead(form)
      setStatus('success')
      setFeedback('Recebemos seu contato. Em breve nossa equipe falará com você.')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setFeedback(err.message || 'Não foi possível enviar. Tente novamente.')
    }
  }

  return (
    <section id="contato" className="py-24 bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase">
            Fale com a NexGuard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3">
            Proteja sua casa ainda hoje
          </h2>
          <p className="text-slate-400">
            Preencha o formulário e nossa equipe entrará em contato em até 24h.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
              <input
                type="text" name="name" required minLength={2} maxLength={100}
                value={form.name} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <input
                type="email" name="email" required
                value={form.email} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mensagem</label>
            <textarea
              name="message" required minLength={10} maxLength={1000} rows={4}
              value={form.message} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {feedback}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> {feedback}
            </div>
          )}

          <button
            type="submit" disabled={status === 'loading'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {status === 'loading'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
              : <><Send className="w-4 h-4" /> Enviar contato</>}
          </button>
        </form>
      </div>
    </section>
  )
}
