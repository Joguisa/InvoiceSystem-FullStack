export enum IdentificationType {
    Cedula = 1,
    RUC = 2,
    Pasaporte = 3
}

export const IdentificationTypeLabels: Record<IdentificationType, string> = {
    [IdentificationType.Cedula]: 'Cédula',
    [IdentificationType.RUC]: 'RUC',
    [IdentificationType.Pasaporte]: 'Pasaporte'
};
