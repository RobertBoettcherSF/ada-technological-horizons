with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;

package body Ath_Growth is
   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Power_Of_Two (Exponent : Long_Float) return Long_Float is
      Rounded : Long_Float;
      Whole   : Integer;
   begin
      if Exponent = 0.0 then
         return 1.0;
      end if;
      --  An integer exponent uses an exact shift. A fractional exponent uses
      --  Exp (x * Log 2). Either result may be non-finite; the caller rejects
      --  that instead of capping it.
      Rounded := Long_Float'Rounding (Exponent);
      if Rounded = Exponent
        and then Rounded >= 0.0
        and then Rounded <= Long_Float (Integer'Last)
      then
         Whole := Integer (Rounded);
         if Whole > 1023 then
            declare
               Huge : Long_Float := Long_Float'Last;
            begin
               return Huge * 2.0;
            end;
         end if;
         return 2.0 ** Whole;
      end if;
      return Ada.Numerics.Long_Elementary_Functions.Exp
        (Exponent * Ada.Numerics.Long_Elementary_Functions.Log (2.0));
   end Power_Of_Two;

   procedure Clear
     (Quantity   : out Long_Float;
      Factor     : out Long_Float;
      Times      : out Sample_Times;
      Quantities : out Sample_Quantities) is
   begin
      Quantity := 0.0;
      Factor := 0.0;
      Times := (others => 0.0);
      Quantities := (others => 0.0);
   end Clear;

   procedure Grow
     (Initial    : Long_Float;
      Doubling   : Long_Float;
      Elapsed    : Long_Float;
      Quantity   : out Long_Float;
      Factor     : out Long_Float;
      Times      : out Sample_Times;
      Quantities : out Sample_Quantities;
      Status     : out Status_Code)
   is
      Exponent : Long_Float;
      Share    : Long_Float;
   begin
      Clear (Quantity, Factor, Times, Quantities);
      if not Is_Finite (Initial) or else not Is_Finite (Doubling)
        or else not Is_Finite (Elapsed)
      then
         Status := Non_Finite_Input;
         return;
      end if;
      if Initial < 0.0 then
         Status := Quantity_Negative;
         return;
      end if;
      if Elapsed < 0.0 then
         Status := Elapsed_Negative;
         return;
      end if;
      if Doubling <= 0.0 then
         Status := Doubling_Not_Positive;
         return;
      end if;

      Exponent := Elapsed / Doubling;
      Factor := Power_Of_Two (Exponent);
      if not Is_Finite (Factor) then
         Clear (Quantity, Factor, Times, Quantities);
         Status := Result_Not_Finite;
         return;
      end if;
      Quantity := Initial * Factor;
      if not Is_Finite (Quantity) then
         Clear (Quantity, Factor, Times, Quantities);
         Status := Result_Not_Finite;
         return;
      end if;

      for Index in Times'Range loop
         if Index = Times'Last then
            Times (Index) := Elapsed;
            Quantities (Index) := Quantity;
         else
            Times (Index) :=
              Elapsed * Long_Float (Index - 1) / Long_Float (Sample_Count - 1);
            Share := Power_Of_Two (Times (Index) / Doubling);
            Quantities (Index) := Initial * Share;
            if not Is_Finite (Times (Index))
              or else not Is_Finite (Share)
              or else not Is_Finite (Quantities (Index))
            then
               Clear (Quantity, Factor, Times, Quantities);
               Status := Result_Not_Finite;
               return;
            end if;
         end if;
      end loop;
      Status := Ok;
   end Grow;
end Ath_Growth;
