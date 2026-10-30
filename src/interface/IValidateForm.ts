

export interface IValidateForm {
  active: boolean;
  data: {
    name: string;
    message: string;
    value: string | number | boolean | Date | undefined | any[] | null;
    category_id?: number | undefined | null;
    dc_max_descuent?: number | undefined | null;
    dc_min_purchase?: number | undefined | null;
    description?: string | undefined | null;
    dp_max_descuent?: number | undefined | null;
    dp_porcent_descuent?: number | undefined | null;
    id?: number | undefined | null;
    o_limit_client?: number | undefined | null;
    peso?: number | undefined | null;
    product_id?: number | undefined | null;
    puntos?: number | undefined | null;
    type_of_promotion_id?: number | undefined | null;
  }[];
}
