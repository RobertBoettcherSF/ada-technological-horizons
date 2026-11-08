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

   function Sum_Of (Values : Fate_Values) return Long_Float is
      Total : Long_Float := 0.0;
   begin
      for Index in Values'Range loop
         Total := Total + Values (Index);
      end loop;
      return Total;
   end Sum_Of;

   procedure Rebalance
     (Base         : Fate_Values;
      Edited_Index : Integer;
      Edited_Value : Long_Float;
      Adjusted     : out Fate_Values;
      Status       : out Status_Code)
   is
      Residual : Long_Float;
      Share    : Long_Float;
      Next     : Long_Float;
      Eligible : Natural;
      Moved    : Boolean;
   begin
      Adjusted := (others => 0.0);
      if Edited_Index < 1 or else Edited_Index > Fate_Count then
         Status := Probability_Out_Of_Range;
         return;
      end if;
      if not Is_Finite (Edited_Value)
        or else Edited_Value < 0.0
        or else Edited_Value > 100.0
      then
         if not Is_Finite (Edited_Value) then
            Status := Non_Finite_Input;
         else
            Status := Probability_Out_Of_Range;
         end if;
         return;
      end if;
      for Index in Base'Range loop
         if not Is_Finite (Base (Index)) then
            Status := Non_Finite_Input;
            return;
         end if;
      end loop;

      Adjusted := Base;
      Adjusted (Edited_Index) := Edited_Value;

      for Pass in 1 .. Fate_Count * 2 loop
         Residual := 100.0 - Sum_Of (Adjusted);
         exit when Residual = 0.0;

         Eligible := 0;
         for Index in Adjusted'Range loop
            if Index /= Edited_Index then
               if (Residual > 0.0 and then Adjusted (Index) < 100.0)
                 or else (Residual < 0.0 and then Adjusted (Index) > 0.0)
               then
                  Eligible := Eligible + 1;
               end if;
            end if;
         end loop;
         exit when Eligible = 0;

         Share := Residual / Long_Float (Eligible);
         Moved := False;
         for Index in Adjusted'Range loop
            if Index /= Edited_Index
              and then ((Residual > 0.0 and then Adjusted (Index) < 100.0)
                        or else (Residual < 0.0 and then Adjusted (Index) > 0.0))
            then
               Next := Adjusted (Index) + Share;
               if Next > 100.0 then
                  Next := 100.0;
               elsif Next < 0.0 then
                  Next := 0.0;
               end if;
               if Next /= Adjusted (Index) then
                  Moved := True;
               end if;
               Adjusted (Index) := Next;
            end if;
         end loop;
         exit when not Moved;
      end loop;

      Residual := 100.0 - Sum_Of (Adjusted);
      if Residual /= 0.0 then
         for Index in Adjusted'Range loop
            if Index /= Edited_Index then
               Next := Adjusted (Index) + Residual;
               if Is_Finite (Next) and then Next >= 0.0 and then Next <= 100.0 then
                  Adjusted (Index) := Next;
                  exit;
               end if;
            end if;
         end loop;
      end if;

      Adjusted (Edited_Index) := Edited_Value;
      Status := Ok;
   end Rebalance;
end Ath_Lifetime;
