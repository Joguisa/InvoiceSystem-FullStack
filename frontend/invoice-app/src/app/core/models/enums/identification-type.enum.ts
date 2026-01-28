export enum IdentificationType {
    Cedula = 0,
    RUC = 1,
    Pasaporte = 2
}

export const IdentificationTypeLabels: Record<IdentificationType, string> = {
    [IdentificationType.Cedula]: 'Cédula',
    [IdentificationType.RUC]: 'RUC',
    [IdentificationType.Pasaporte]: 'Pasaporte'
};
