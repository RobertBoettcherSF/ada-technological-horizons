with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;

package body Ath_Choice is
   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Is_Integer (Value : Long_Float) return Boolean is
   begin
      return Is_Finite (Value) and then Value = Long_Float'Truncation (Value);
   end Is_Integer;

   function Stable_Log2 (Value : Long_Float) return Long_Float is
      Raw : constant Long_Float :=
        Ada.Numerics.Long_Elementary_Functions.Log (Value)
        / Ada.Numerics.Long_Elementary_Functions.Log (2.0);
      Nearest : constant Long_Float := Long_Float'Rounding (Raw);
      Scale : constant Long_Float := Long_Float'Max (1.0, abs (Nearest));
   begin
      if abs (Raw - Nearest) <= 1.0e-9 * Scale then
         return Nearest;
      end if;
      return Raw;
   end Stable_Log2;

   function Code_Length (Ideal : Long_Float) return Long_Float is
   begin
      if Ideal = Long_Float'Rounding (Ideal) then
         return Long_Float'Rounding (Ideal);
      end if;
      return Long_Float'Ceiling (Ideal);
   end Code_Length;

   function Integer_Power (Base, Exponent : Long_Float) return Long_Float is
      Result : Long_Float := 1.0;
      Left : Long_Float := Exponent;
   begin
      if Exponent = 0.0 or else Base = 1.0 then
         return 1.0;
      end if;
      if Exponent > 4_096.0 then
         return Ada.Numerics.Long_Elementary_Functions.Exp
           (Exponent * Ada.Numerics.Long_Elementary_Functions.Log (Base));
      end if;
      while Left > 0.0 loop
         Result := Result * Base;
         if not Is_Finite (Result) then
            return Result;
         end if;
         Left := Left - 1.0;
      end loop;
      return Result;
   end Integer_Power;

   procedure Clear
     (Bits_Per, Total_Bits, Code_Per, Code_Total : out Long_Float;
      Combinations, Log10_Count : out Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : out Boolean;
      Axis_X_Max, Axis_Y_Max : out Long_Float;
      Repeats_Out : out Sample_Repeats;
      Totals_Out : out Sample_Bits) is
   begin
      Bits_Per := 0.0;
      Total_Bits := 0.0;
      Code_Per := 0.0;
      Code_Total := 0.0;
      Combinations := 0.0;
      Log10_Count := 0.0;
      Combinations_Valid := False;
      Combinations_Exact := False;
      Code_Total_Valid := False;
      Axis_X_Max := 0.0;
      Axis_Y_Max := 0.0;
      Repeats_Out := (others => 0.0);
      Totals_Out := (others => 0.0);
   end Clear;

   procedure Choose
     (Possibilities, Repeats : Long_Float;
      Bits_Per, Total_Bits, Code_Per, Code_Total : out Long_Float;
      Combinations, Log10_Count : out Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : out Boolean;
      Axis_X_Max, Axis_Y_Max : out Long_Float;
      Repeats_Out : out Sample_Repeats;
      Totals_Out  : out Sample_Bits;
      Status : out Status_Code) is
      Span : constant Long_Float := Long_Float (Sample_Count - 1);
   begin
      Clear
        (Bits_Per, Total_Bits, Code_Per, Code_Total, Combinations, Log10_Count,
         Combinations_Valid, Combinations_Exact, Code_Total_Valid,
         Axis_X_Max, Axis_Y_Max, Repeats_Out, Totals_Out);
      if not Is_Finite (Possibilities) or else not Is_Finite (Repeats) then
         Status := Non_Finite_Input;
         return;
      end if;
      if not Is_Integer (Possibilities) or else not Is_Integer (Repeats) then
         Status := Not_Integer;
         return;
      end if;
      if Possibilities < 1.0 then
         Status := Count_Not_Positive;
         return;
      end if;
      if Repeats < 0.0 then
         Status := Repeats_Negative;
         return;
      end if;
      if Possibilities > Max_Exact_Integer or else Repeats > Max_Exact_Integer then
         Status := Out_Of_Range;
         return;
      end if;

      Bits_Per := Stable_Log2 (Possibilities);
      Total_Bits := Repeats * Bits_Per;
      Code_Per := Code_Length (Bits_Per);
      Code_Total := Repeats * Code_Per;
      if not Is_Finite (Bits_Per) or else not Is_Finite (Total_Bits)
        or else not Is_Finite (Code_Per)
      then
         Clear
           (Bits_Per, Total_Bits, Code_Per, Code_Total, Combinations, Log10_Count,
            Combinations_Valid, Combinations_Exact, Code_Total_Valid,
            Axis_X_Max, Axis_Y_Max, Repeats_Out, Totals_Out);
         Status := Result_Not_Finite;
         return;
      end if;
      Code_Total_Valid := Is_Finite (Code_Total);
      if not Code_Total_Valid then
         Code_Total := 0.0;
      end if;

      Log10_Count :=
        Repeats * Ada.Numerics.Long_Elementary_Functions.Log (Possibilities)
        / Ada.Numerics.Long_Elementary_Functions.Log (10.0);
      if not Is_Finite (Log10_Count) then
         Clear
           (Bits_Per, Total_Bits, Code_Per, Code_Total, Combinations, Log10_Count,
            Combinations_Valid, Combinations_Exact, Code_Total_Valid,
            Axis_X_Max, Axis_Y_Max, Repeats_Out, Totals_Out);
         Status := Result_Not_Finite;
         return;
      end if;

      Combinations := Integer_Power (Possibilities, Repeats);
      Combinations_Valid := Is_Finite (Combinations);
      Combinations_Exact :=
        Combinations_Valid and then Repeats <= 4_096.0
        and then Combinations <= Max_Exact_Integer
        and then Combinations = Long_Float'Truncation (Combinations);
      if not Combinations_Valid then
         Combinations := 0.0;
      end if;

      if Repeats = 0.0 then
         Axis_X_Max := 1.0;
      else
         Axis_X_Max := Repeats;
      end if;
      if Total_Bits = 0.0 then
         Axis_Y_Max := 1.0;
      else
         Axis_Y_Max := Total_Bits * 1.25;
      end if;

      for Index in 1 .. Sample_Count loop
         declare
            Fraction : constant Long_Float := Long_Float (Index - 1) / Span;
            Step : constant Long_Float := Repeats * Fraction;
            Info : constant Long_Float := Step * Bits_Per;
         begin
            Repeats_Out (Index) := Step;
            Totals_Out (Index) := Info;
         end;
      end loop;
      Status := Ok;
   end Choose;
end Ath_Choice;
