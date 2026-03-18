import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useCreatePaste } from '../hooks/use-create-paste';
import type { Visibility } from '@pastebin/shared';
import { CreatePasteSchema } from '@pastebin/shared';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const visibilityArr = ['public'
    , 'private'
    , 'unlisted']
  const expireArr = ['3m', '1h', '1d', '1w', '1y', 'n']
  const expireTextArr = ['3 Min', '1 Hour', '1 Day', '1 Week', '1 Year', 'Never']

  const { mutate, isPending, isError } = useCreatePaste();
  const [title, setTitle] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [debouncedText, setDebouncedText] = useState<string>('')
  const [errMsg, setErrMsg] = useState<string>('')
  const [selVis, setSelVis] = useState<string>(visibilityArr[0]);
  const [selExpire, setSelExpire] = useState<string>(expireArr[0]);
  const [password, setPassword] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false)

  const createPaste = async () => {
    const reqData = {
      title: title || 'Untitled',
      content: text,
      visibility: selVis as Visibility,
      expiresAt: selExpire,
      ...(selVis === 'private' ? { password } : {}),
    }
    const check = CreatePasteSchema.safeParse(reqData);
    if (!check.success) {
      const firstError = check.error.issues[0];
      setErrMsg(firstError?.message || 'Invalid input')
      return
    }
    setErrMsg('')
    console.log(title, text, selVis, selExpire)
    mutate(reqData);
  }

  const highlighted = useMemo(() => {
    if (!debouncedText) return { value: '', language: 'plaintext' };

    return hljs.highlightAuto(debouncedText);
  }, [debouncedText]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedText(text)
    }, 300)

    return () => clearTimeout(timeout)
  }, [text]);

  return (
    <div className="space-y-4">
      <input type="text"
        onChange={(ev) => {
          setTitle(ev.target.value)
        }}
        value={title}
        className=' focus:outline-hidden  font-paste  bg-brand-slate  border border-brand-border rounded-sm p-4 md:w-xl w-full'
        placeholder='Title'
      />


      <div className='text-brand-text-primary font-medium flex gap-6 md:flex-row flex-col'>

        <div className='flex md:flex-row flex-col'>
          <label htmlFor="visi-select" className='md:w-32 w-full p-2'>Visibility:</label>
          <select
            name="visi-select" id="visi-select"
            value={selVis}
            onChange={(ev) => {
              setSelVis(ev.target.value.toLowerCase())
            }}
            className='p-2 bg-brand-slate  border border-brand-border rounded md:w-48 w-full'
          >
            {
              visibilityArr.map((el) => {
                return <option value={el}>{el.toUpperCase()}</option>
              })
            }
          </select>
        </div>

        {selVis === 'private' && (
          <div className='flex md:flex-row flex-col'>
            <label htmlFor="password" className='md:w-48 w-full p-2'>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className='p-2 bg-brand-slate border border-brand-border rounded md:w-48 w-full'
              placeholder="Min 4 chars"
              minLength={4}
            />
          </div>
        )}

      </div>

      <div className='text-brand-text-primary font-medium flex gap-6 md:flex-row flex-col'>

        <div className='flex md:flex-row flex-col'>
          <label htmlFor="expire-select" className='md:w-32 w-full p-2'>Expire:</label>
          <select name="expire-select" id="expire-select"
            className='p-2 bg-brand-slate  border border-brand-border rounded md:w-48 w-full'

            value={selExpire}
            onChange={(ev) => {
              setSelExpire(expireArr[ev.target.selectedIndex])
            }}
          >
            {
              expireArr.map((el, idx) => {
                return <option value={el}>{expireTextArr[idx]}</option>
              })
            }
          </select>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <button
          data-state={isPreview}
          onClick={
            () => {
              setIsPreview(!isPreview)
            }
          }
          className="cursor-pointer border hover:bg-brand-green data-[state=true]:bg-brand-green text-white px-6 py-2 rounded-md font-medium transition-colors">
          Preview
        </button>

        <button
          onClick={createPaste}
          className="cursor-pointer bg-brand-green hover:bg-brand-green-hover text-white px-6 py-2 rounded-md font-medium transition-colors">
          {isPending ? 'Creating...' : 'Create Paste'}
        </button>
      </div>

      {(isError || errMsg) ?? <p className="text-red-900">{errMsg || 'Something went wrong.'}</p>}


      <div className="flex justify-end text-xs text-gray-400 ">
        <span className="uppercase font-bold">Detected: {highlighted.language}</span>
      </div>

      <div className='bg-brand-slate w-full h-[32rem] bg-brand-slate border border-brand-border rounded-lg overflow-hidden shadow-inner'>
        {
          isPreview
            ? (
              <pre className="w-full h-full p-4 overflow-auto font-mono scrollbar-thin scrollbar-thumb-brand-border">
                <code
                  className={`hljs language-${highlighted.language}`}
                  // We use dangerouslySetInnerHTML because highlightAuto 
                  // returns a string of HTML with <span> tags for colors.
                  dangerouslySetInnerHTML={{ __html: highlighted.value }}
                />
              </pre>
            )
            : (
              <textarea
                onChange={(ev) => {
                  setText(ev.target.value)
                }}
                value={text}
                spellCheck="false"
                className="w-full h-full p-4 bg-transparent text-white font-mono resize-none focus:outline-none placeholder:opacity-30"
                placeholder="Paste your text here..."
              />)
        }
      </div>
    </div>
  );
}