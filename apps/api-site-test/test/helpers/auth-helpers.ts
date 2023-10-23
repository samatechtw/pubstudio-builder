import { UserType } from '@pubstudio/shared/type-api-platform-user'
import jwt from 'jsonwebtoken'
import { testConfig } from '../test.config'

export const adminAuthHeader = () => {
  const adminId = 'b8d4843e-4b83-4340-9104-5b225ae551d5'
  const authToken = generateAuthToken(adminId, UserType.Admin)
  return `Bearer ${authToken}`
}

export const ownerAuthHeader = (userId: string) => {
  const authToken = generateAuthToken(userId, UserType.Owner)
  return `Bearer ${authToken}`
}

export const generateAuthToken = (userId: string, userType: UserType): string => {
  const keyBase64 = testConfig.get('authToken.adminPrivateKey')
  const privateKey = Buffer.from(keyBase64, 'base64').toString('utf8')
  const siteAdminTokenExpiresIn: string = testConfig.get('authToken.adminExpiresIn')
  return jwt.sign({ sub: userId, user_type: userType }, privateKey, {
    algorithm: 'RS256',
    expiresIn: siteAdminTokenExpiresIn,
  })
}

// exp 2023-08-04T02:06:32.000Z
export const expiredAdminToken =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiOGQ0ODQzZS00YjgzLTQzNDAtOTEwNC01YjIyNWFlNTUxZDUiLCJ1c2VyX3R5cGUiOiJBZG1pbiIsImV4cCI6MTY5MTExNDc5Mn0.HxbbyVUmzMdrxLDudcpUrtdmkazOLNU0tUMIxYntfntkjoScFNiHHOfS8AOlukapP5u3-1Ep-XrwrlvqhERv7_XiwSwFlqfskc8GRwn-AZNk_PR6Ag8A36g9Pm-5GOM4HJyruF6mWiXuFUdGWBSYq7Mv7KG5sWFW81ZiBLq1TUeAwTe82tYGtb_ZA-ydPeM_0ChQPEXKTPEzvUW5JkfGZ7gxGc255tOLrKDE6NimPsXGwRQkHecY9w7EMGnpJbfsGQThzI9dtpfyxwUtycJo7TtLjiwAH8iHahBGqWDZl-1k7YcvB0vDdDAG051xOuH_eLxEEvYsnmLRNRZzj2JzBQeGevwq6VLL-LvvQXii8DZemGBQE9Fq8_ugSbCpDmS6lmzfMwuMK_yYKYTFPhomoxeK8q6arzPtwTvoWthQLUsBJYSgOvhrAQTNz799xspYgEd61eMOYNvFhPaMXWP_L-BMkFm-i9kZlQkvADFaDg96Y1m6l0D0mQiWFaKhhFZH-z6AzSaQuiGhwh3lXBAWg-fgdpLBNZTzsCmvnf3Rljx7cgI_hcNmT9RQpnF62Nyg2eNFkpoLPVLrOVOTZCBjmbnAAeK_pdfRukuX167Inuf3ul8w4tvsh5wDRuTugnwSP16Mma3ZupGtAOaFstniP0OeB7pjQoU1NTx6GejLVk8'
// exp 2023-09-10T06:08:55.000Z
export const expiredUser1Token =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5MDNiM2MyOC1kZWFhLTQ1ZGMtYTQzZi01MTFmZTk2NWQzNGUiLCJ1c2VyX3R5cGUiOiJPd25lciIsImV4cCI6MTY5NDMyNjEzNX0.G3bbXGcMuI_rXTSCFLm1GEj06S8b1yt47HrzL9XNlh4l9ih1w9-yPJQQfKw5oxy5G5vmELbgQ5YFZz94Vn0QPGEZtfz1Pgh6sz6tbh5xLPFBJlvdLH5z9hDQ6OsLb55GhFOf57Ui4ADizcD7qSmJ1fWVSjdmx7bubGnX_DFtB6o0apEMCK3OLyKMCLqKFD7tOwTpathvJhbTBpfjelg8kUV3NILYiDnAotHuBj2vk7X5SSmX1KTob2AM0LZ6lPmeRsJWeKAkjJ1xG6CTr3MTOVg85tsLholkyvbG5ENLIWRc6IvMXZ0FUIsGkWMHotZ_vQqDoKiVVco_QTrPFSmLtGkdTgCZbOWF0uQ8Q__sKyzQ8C_1vS3qJQXGFQ7ME-ELlPhq902OcJ9kCaSyv_dgsi40H9sgOkFtxm2-AvR_vJKAL3XJH1OLmt0FjoAoF8R-iGpXzIm6nIwOGQGaMEem6uK6hcJ1cj_kQqP7UAz45FOTYzyYfh1coslm6iPYFiIzct8XwE5p_FqhivgoMAVinTgC2VVecinvybINAwSVwgx-T-SuGxxP8IhGFF_E-5ivgEYSYapS5d-GlKufVXclyxlmhk6N6MZg801k2sokBKgYPX9hr987hLLrOS_KxK_0UlKuWFDFnYkw4DMn9s1yt-E7AUE4rMjmlr9oEJShsEA'
