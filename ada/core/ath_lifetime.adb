with Ada.Unchecked_Conversion;

package body Ath_Lifetime is
   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   procedure Clear
     (Contributions : out Fate_Values;
      Mean          : out Long_Float) is
   begin
      Contributions := (others => 0.0);
      Mean := 0.0;
   end Clear;

   procedure Weighted_Mean
     (Percentages   : Fate_Values;
      Durations     : Fate_Values;
      Contributions : out Fate_Values;
      Mean          : out Long_Float;
      Status        : out Status_Code)
   is
      Total  : Long_Float := 0.0;
      Sum    : Long_Float := 0.0;
      Weight : Long_Float;
      Share  : Long_Float;
   begin
      Clear (Contributions, Mean);

      for Index in Percentages'Range loop
         if not Is_Finite (Percentages (Index))
           or else not Is_Finite (Durations (Index))
         then
            Status := Non_Finite_Input;
            return;
         end if;
      end loop;

      for Index in Percentages'Range loop
         if Percentages (Index) < 0.0 or else Percentages (Index) > 100.0 then
            Status := Probability_Out_Of_Range;
            return;
         end if;
      end loop;

      for Index in Durations'Range loop
         if Durations (Index) < 0.0 then
            Status := Duration_Negative;
            return;
         end if;
      end loop;

      for Index in Percentages'Range loop
         Total := Total + Percentages (Index);
      end loop;
      if not Is_Finite (Total) or else abs (Total - 100.0) > Total_Tolerance then
         Status := Total_Out_Of_Range;
         return;
      end if;

      for Index in Percentages'Range loop
         Weight := Percentages (Index) / 100.0;
         Share := Weight * Durations (Index);
         if not Is_Finite (Share) then
            Clear (Contributions, Mean);
            Status := Result_Not_Finite;
            return;
         end if;
         Contributions (Index) := Share;
         Sum := Sum + Share;
         if not Is_Finite (Sum) then
            Clear (Contributions, Mean);
            Status := Result_Not_Finite;
            return;
         end if;
      end loop;

      Mean := Sum;
      Status := Ok;
   end Weighted_Mean;
end Ath_Lifetime;
