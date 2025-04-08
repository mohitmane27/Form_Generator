import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DynamicFormWizard from './Components/DynamicFormWizard';
import schema from "./formSchema.json"; //


function App() {
  const [schema, setSchema] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setSchema(json);
      } catch (err) {
        alert("Invalid JSON file!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dynamic Form Generator</h1>

      {!schema && (
        <div className="mb-6">
          <label className="block mb-2">Upload your schema.json</label>
          <input type="file" accept=".json"className='border rounded text-center' onChange={handleFileUpload} />
        </div>
      )}

      {schema && <DynamicFormWizard schema={schema} />}
    </div>
  );

}

export default App
