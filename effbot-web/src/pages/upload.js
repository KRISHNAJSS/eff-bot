"use client"
import { ChangeEvent, useState } from "react"

//Create Initial UI
//Create file upload logic (uploading an image, base64 string)
//Create the API route logic (POST api/analyzeImage, openai logic)
//Handle streaming of data to frontend


export default function Upload() {
  const [image, setImage] = useState("");
  const [openAIResponse, setOpenAIResponse] = useState("");
  // useState to hold a base64 string
  // useState to hold the chatGPT response

  //Image upload logic
  //1. User upload an image
  //2. We can take the image and convert it into a b64 string
  //3. When we request API route we create, we will pass the image string to the backend

  function handleFileChange(event){

    if (event.target.files === null){
      window.alert("No file selected. Choose a file")
      return;
    }
    const file = event.target.files[0];

    // Convert the users file to a base64 string
    //FileReader
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      // reader.result -> base 64 string
      if (typeof reader.result === "string"){
        console.log(reader.result);
        setImage(reader.result);
      }
    }

    reader.onerror = (error) => {
      console.log("error: "+ error);
    }
  }

  async function handleSubmit(event){
    event.preventDefault();

    if(image===""){
      alert("Upload an image.")
      return;
    }

    //POST api/image
    await fetch("api/image",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        image:{image}
      })
    }).then(async(response)=>{
      //bcoz we are getting a streaming text response
      //we have to make some logic to handle streaming text
      const reader = response.body?.getReader();
      while (true){
        const {done, value} = await reader?.read();

        if (done) {
          break;
        }

        var currentChunk = new TextDecoder().decode(value);
        setOpenAIResponse((prev) => prev+currentChunk);
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-md text-white" >
      <div className="bg-slate-800 w-full max-w-2xl rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold mb-4">Uploaded Image</h2>
        {image !== ""?
          <div className="mb-4 overflow-hidden">
            <img src={image}
              className = "w-full object-conatin max-h-72"
            />
          </div> 
          :
          <div className="mb-4 p-8 text-center">
          <p>Once you upload an image, you will see it here.</p>
        </div> 
      }
        
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="flex flex-col mb-6">
            <label className ='mb-2 text-sm font-medium'>Upload Image</label>
            <input
              className="text-sm border rounded-lg cursor-pointer"
              type="file"
              onChange={(e)=> handleFileChange(e)}
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="p-2 bg-sky-600 rounded-md mb-4">
              Ask Effbot to Analyze your Image
            </button>
          </div>
          
        </form>
        {openAIResponse !== ""?
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-xl font-bold mb-2">AI Response</h2>
            <p>{openAIResponse}</p>
          </div>
        :
        null
      }
        
      </div>
    </div>
  )
}