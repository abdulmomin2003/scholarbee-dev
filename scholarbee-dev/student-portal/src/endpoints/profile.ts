import {
  ContactInfoProps,
  EducationalInfoProps,
  PersonalInformationProps
} from '@/app/create-profile/constants/types';
import { NEXT_PUBLIC_API_CMS_URL } from '@/constants/config';
import axios from 'axios';

export class ProfileApi {
  token: string;
  constructor(token: string) {
    this.token = token;
  }
  async updateUser(
    userData: PersonalInformationProps | ContactInfoProps | EducationalInfoProps
  ) {
    try {
      const response = await axios.put(
        `${NEXT_PUBLIC_API_CMS_URL}/users/66cc3146ede2b4cdefa21576`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      console.log('response on update user Api', response);
      if (response.status === 200) {
        console.log('response.data', response.data.docs);
        return {
          success: true,
          data: response.data.docs
        };
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
