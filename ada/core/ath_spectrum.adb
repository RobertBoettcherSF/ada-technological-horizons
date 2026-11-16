with Ada.Unchecked_Conversion;

package body Ath_Spectrum is
   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits := (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   procedure Place
     (Wavelength : Long_Float;
      Position   : out Long_Float;
      Status     : out Status_Code) is
      Width : constant Long_Float := Window_Max - Window_Min;
   begin
      Position := 0.0;
      if not Is_Finite (Wavelength) then
         Status := Non_Finite;
         return;
      end if;
      if Wavelength < Window_Min or else Wavelength > Window_Max then
         Status := Outside;
         return;
      end if;
      Position := (Wavelength - Window_Min) / Width;
      Status := Ok;
   end Place;

   procedure Map_Lines
     (Line_Wavelength : out Wavelengths;
      Line_Kind       : out Kinds;
      Line_Position   : out Positions;
      Axis_Min        : out Long_Float;
      Axis_Max        : out Long_Float) is
      --  Air wavelengths in nanometres. Fraunhofer lines first, then Tc I.
      Catalog : constant Wavelengths :=
        (393.366, 396.847, 410.174, 422.673, 434.047,
         403.163, 423.819, 426.227, 429.706);
      Status : Status_Code;
   begin
      Axis_Min := Window_Min;
      Axis_Max := Window_Max;
      for Index in Catalog'Range loop
         Line_Wavelength (Index) := Catalog (Index);
         if Index <= 5 then
            Line_Kind (Index) := Kind_Shared;
         else
            Line_Kind (Index) := Kind_Technetium;
         end if;
         Place (Catalog (Index), Line_Position (Index), Status);
      end loop;
   end Map_Lines;

   procedure Map_Ticks
     (Tick_Wavelength : out Tick_Wavelengths;
      Tick_Position   : out Tick_Positions) is
      Catalog : constant Tick_Wavelengths := (390.0, 400.0, 410.0, 420.0, 430.0, 440.0);
      Status : Status_Code;
   begin
      for Index in Catalog'Range loop
         Tick_Wavelength (Index) := Catalog (Index);
         Place (Catalog (Index), Tick_Position (Index), Status);
      end loop;
   end Map_Ticks;
end Ath_Spectrum;
