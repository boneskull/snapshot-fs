declare module '@matteo.collina/snap' {
  export default function Snap(
    filepath: string,
  ): (value: any) => Promise<string>;
}
