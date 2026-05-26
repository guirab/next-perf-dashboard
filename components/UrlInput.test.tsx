import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlInput } from './UrlInput'

function setup(onAnalyze = vi.fn()) {
  const user = userEvent.setup()
  render(<UrlInput onAnalyze={onAnalyze} isLoading={false} />)
  return { user, onAnalyze }
}

describe('UrlInput', () => {
  it('renders input and button', () => {
    setup()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument()
  })

  it('button is disabled when input is empty', () => {
    setup()
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled()
  })

  it('button is disabled while loading', () => {
    render(<UrlInput onAnalyze={vi.fn()} isLoading={true} />)
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled()
  })

  it('shows error when submitting empty input', async () => {
    const { user } = setup()
    const input = screen.getByRole('textbox')
    await user.type(input, ' ')
    await user.clear(input)
    // force-enable button state by typing then clearing
    // instead, test via form submit key
    await user.type(input, 'a')
    await user.clear(input)
    await user.type(input, 'a')
    await user.clear(input)
    // submit directly
    const form = input.closest('form')!
    form.dispatchEvent(new Event('submit', { bubbles: true }))
    expect(await screen.findByText(/please enter a url/i)).toBeInTheDocument()
  })

  it('normalizes URLs without protocol before calling onAnalyze', async () => {
    const { user, onAnalyze } = setup()
    await user.type(screen.getByRole('textbox'), 'github.com')
    await user.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onAnalyze).toHaveBeenCalledWith('https://github.com')
  })

  it('preserves https:// URLs as-is', async () => {
    const { user, onAnalyze } = setup()
    await user.type(screen.getByRole('textbox'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onAnalyze).toHaveBeenCalledWith('https://example.com')
  })

  it('preserves http:// URLs as-is', async () => {
    const { user, onAnalyze } = setup()
    await user.type(screen.getByRole('textbox'), 'http://example.com')
    await user.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onAnalyze).toHaveBeenCalledWith('http://example.com')
  })

  it('shows validation error for invalid URL', async () => {
    const { user, onAnalyze } = setup()
    await user.type(screen.getByRole('textbox'), 'not a valid url!@#')
    await user.click(screen.getByRole('button', { name: /analyze/i }))
    expect(await screen.findByText(/valid url/i)).toBeInTheDocument()
    expect(onAnalyze).not.toHaveBeenCalled()
  })
})
