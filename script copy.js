const video = document.getElementById('video');

Promise.all([
faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam).then(faceRecognition)



function startWebcam() {
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
}).then((stream)=> {
        video.srcObject = stream
    }).catch((error)=> {
        console.error(error)
    })

}

function getLabeledFaceDescriptions(){
    const labels = ["Martin", "Messi", "Data"]
    return Promise.all(
        labels.map(async (label)=>{
          const  descriptions = []
            for (i=1;i<=2;i++){
                const image = await faceapi.fetchImage(`./labels/${label}/${i}.png`)
                const detections = await faceapi
                .detectSingleFace(image)
                .withFaceLandmarks()
                .withFaceDescriptor();
    
                descriptions.push(detections.descriptor);
            }
            return new faceapi.getLabeledFaceDescriptors(label,descriptions)
        })
    ) 
}



async function faceRecognition(){
    const getLabeledFaceDescriptors = await getLabeledFaceDescriptions()
    const faceMatcher= new faceapi.faceMatcher(labeledFaceDescriptors)

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = {width:video.width, height: video.height}
        faceapi.matchDimensions(canvas,displaySize)

        setInterval( async ()=> {
            const detections = await faceapi
            .detectAllFaces(video)
            .withLandmarks()
            .withFaceDescriptors()

            const resizeDetections = faceapi.resizeResults(detections,displaySize)
            canvas.getContext('2d').cleanReact(0, 0, canvas.width, canvas.height)
            const results =  resizeDetecionts.map(( d) => {
                return faceMatcher.findBestMach(d.descriptor)

            })
            results.forEach((result,i)=> {
                const box = resizeDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box,
                    {label: result} )
                    drawBox.draw(canvas)
            })
        },100)
    })
}