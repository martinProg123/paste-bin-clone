import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useCreatePaste } from '../hooks/use-create-paste';
import type { Visibility } from '@pastebin/shared';
import { CreatePasteSchema } from '@pastebin/shared';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const visibilityArr = ['public'
    // , 'private' 
    , 'unlisted']
  const expireArr = ['3m', '1h', '1d', '1w', '1y', 'n']
  const expireTextArr = ['3 Min', '1 Hour', '1 Day', '1 Week', '1 Year', 'Never']

  const { mutate, isPending, isError } = useCreatePaste();
  const [title, setTitle] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [errMsg, setErrMsg] = useState<string>('')
  const [selVis, setSelVis] = useState<string>(visibilityArr[0]);
  const [selExpire, setSelExpire] = useState<string>(expireArr[0]);

  const createPaste = async () => {
    const reqData = {
      title: title || 'Untitled',
      content: text,
      visibility: selVis as Visibility,
      expiresAt: selExpire,
    }
    const check = CreatePasteSchema.safeParse(reqData);
    if (!check.success){
      setErrMsg('Paste Content Cannot be Empty')
      return
    }
    console.log(title, text, selVis, selExpire)
    mutate(reqData);
  }

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

        <div className='flex md:flex-row flex-col'>
          <label htmlFor="" className='md:w-48 w-full p-2'>Expire:</label>
          <select name="" id=""
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

      <div className='flex justify-end'>
        <button
          onClick={createPaste}
          className="cursor-pointer bg-brand-green hover:bg-brand-green-hover text-white px-6 py-2 rounded-md font-medium transition-colors">
          {isPending ? 'Creating...' : 'Create Paste'}
        </button>
      </div>

      {(isError || errMsg)??<p className="text-red-900">{errMsg||'Something went wrong.'}</p>}

      <textarea
        onChange={(ev) => {
          setText(ev.target.value)
        }}
        value={text}
        className="w-full h-[32rem] p-4 resize-none font-paste border border-brand-border bg-brand-slate rounded shadow-inner focus:outline-hidden "
        placeholder="Paste your text here..."
      />


    </div>
  );
}