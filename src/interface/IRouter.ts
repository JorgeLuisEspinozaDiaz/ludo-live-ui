export interface IRouterStructure {
  path: string;
  element: () => React.JSX.Element;
  isPublic: boolean;
}
