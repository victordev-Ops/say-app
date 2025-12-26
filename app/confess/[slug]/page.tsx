export default function Confess({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form className="w-full max-w-md">
        <h2 className="text-lg font-bold mb-3">Send anonymous message</h2>
        <textarea className="w-full p-3 rounded-xl border" />
        <button className="btn-primary mt-3 w-full">Send</button>
      </form>
    </div>
  )
}
