/**
 * Response DTO for password generation
 */
export class GeneratePasswordResponseDto {
  password!: string;

  constructor(password: string) {
    this.password = password;
  }
}

