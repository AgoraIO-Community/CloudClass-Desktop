import { GenericErrorWrapper } from 'agora-rte-sdk';
// const myHeaders = new Headers();
// myHeaders.append("token", "eyJhbGciOiJIUzI1NiJ9.eyJwcmltYXJ5U3RyZWFtVXVpZCI6IjE5NjU3ODQ1MzgiLCJhcHBJZCI6ImY0ODg0OTNkMTg4NjQzNWY5NjNkZmIzZDk1OTg0ZmQ0IiwidXNlclV1aWQiOiJsaXlhbmcxIiwicm9vbVV1aWQiOiJjb3Vyc2V3YXJlMCIsImlhdCI6MTYxMzEzMjE0Mn0.ZqBsGg-fEpBNM-ZB7yA4meWwIPX0eq4pildVwkUrCd4");

export async function fetchPPT() {
  let res = await fetch("https://api-solutions-dev.bj2.agoralab.co/scene/apps/f488493d1886435f963dfb3d95984fd4/v1/rooms/courseware0/users/liyang1/properties/resources", {
    method: 'GET',
    headers: {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJwcmltYXJ5U3RyZWFtVXVpZCI6IjE5NjU3ODQ1MzgiLCJhcHBJZCI6ImY0ODg0OTNkMTg4NjQzNWY5NjNkZmIzZDk1OTg0ZmQ0IiwidXNlclV1aWQiOiJsaXlhbmcxIiwicm9vbVV1aWQiOiJjb3Vyc2V3YXJlMCIsImlhdCI6MTYxMzEzMjE0Mn0.ZqBsGg-fEpBNM-ZB7yA4meWwIPX0eq4pildVwkUrCd4"
    },
  })
  const resText: any = await res.text()
  const text = JSON.parse(resText)
  if (text.code !== 0) {
    throw new GenericErrorWrapper({
      message: text.msg,
      code: text.code
    })
  }
  const ppts = Object.keys(text.data).map((key: string) => text.data[key])
  return ppts
}