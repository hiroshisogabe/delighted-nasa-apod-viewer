Implement the visualization of images from NASA's APOD (Astronomy Picture of the Day) using the existing frontend and backend.

Nothing will be shown until the user decides to see either:
- the picture of the day
- some random picture from NASA's APOD

To get the data, the endpoint is APOD API using the API_KEY=NgGVwXMeDGSfF1famYAEDZKkHeNKS8GsTCtX0q3e
- https://api.nasa.gov/planetary/apod?api_key=API_KEY
- As the API documentation says: "an optional return parameter 'copyright' is returned if the image is not public domain"; which should be considered when returning the data and showing the image info

The existing frontend should fetch data from the existing backend, therefore any specifics related to the fetch to the API, e.g. the API_KEY will be in the backend side.

Create an endpoint in the backend to be consumed by the frontend which renders the image and its details.
