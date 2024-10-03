export function Resume() {
  return (
    <div className="flex justify-center">
      <div className="flex-1 flex gap-4 p-4 max-w-4xl">
        <div>
          <h3 className="text-lg font-bold">Specialties</h3>
          <ol className="text-gray-300">
            <li>React</li>
            <li>Typescript</li>
            <li>CSS</li>
            <li>AWS</li>
          </ol>
        </div>
        <div className="flex flex-col font-thin">
          <h1 className="text-2xl">
            <strong>Tyler</strong> Schloesser
          </h1>
          <h2 className="text-xl">Frontend Engineer</h2>
        </div>
      </div>
    </div>
  )
}
