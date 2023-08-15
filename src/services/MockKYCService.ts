// private async mockGreenIdCall(_props: VerifyProps) {
//     const { user, licence, medicare } = _props;
//     this.logger.debug("Mocking verification response to save money!");
//     if (
//         licence.licenceNumber === "11111111" &&
//         medicare.number === "2111111111"
//     ) {
//         const signedNameCredential =
//             await this.createJWTVerifiableCredential(
//                 "NameCredential",
//                 user.name
//             );
//         const signedDobCredential =
//             await this.createJWTVerifiableCredential(
//                 "BirthCredential",
//                 user.dob
//             );

//         const PGPSignedNameCredential =
//             await this.createPGPVerifiableCredential(
//                 "NameCredential",
//                 user.name
//             );
//         const PGPSignedDobCredential =
//             await this.createPGPVerifiableCredential(
//                 "BirthCredential",
//                 user.dob
//             );

//         return {
//             success: true,
//             didJWTCredentials: [signedNameCredential, signedDobCredential],
//             didPGPCredentials: [
//                 PGPSignedNameCredential,
//                 PGPSignedDobCredential
//             ]
//         };
//     }

//     throw new Error("Error, please contact support");
// }